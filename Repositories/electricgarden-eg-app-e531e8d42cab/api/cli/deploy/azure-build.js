#!/usr/bin/env node
// This script sets up function packages for uploading to Azure

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

const sourceDirectory = path.resolve(__dirname, 'dist-src');
const outputDirectory = path.resolve(__dirname, 'dist');

// Copies the static sources and packed index of a function into a function app.
const copySources = function(destDir, { functions, statics, folder }) {
  const resolvedStatics = [].concat(...statics.map((static) => functions.map((name) => path.join(name, static))));
  for (const static of resolvedStatics) {
    const staticSource = folder ? path.resolve('../../funcs', folder, static) : path.resolve('../../funcs', static);
    const staticDest = path.join(destDir, '/', static);
    const staticDestDir = path.dirname(staticDest);
    fs.ensureDirSync(staticDestDir);
    fs.copySync(staticSource, staticDest);
  }
  for (const name of functions) {
    const packedSource = path.join('./pack/', name);
    const staticDestDir = path.join(destDir, '/', name);
    fs.copySync(packedSource, staticDestDir);
  }
};

// Compiles sources and then generates a zip file for a function app
const buildApp = function(appName) {
  let appSource = path.join('./functionapps/', appName);
  let appDest = path.join(sourceDirectory, appName);

  // Copy root level files for function app
  fs.copySync(appSource, appDest, {
    filter: (src) => !src.includes('definition.json'),
  });

  // Load list of functions in this app from the definition.json file.
  const definitionPath = path.join(appSource, '/definition.json');
  const definition = JSON.parse(
    fs.readFileSync(definitionPath),
  );
  if (!Array.isArray(definition.statics)) {
    throw new Error(`Definition ${definitionPath} missing or invalid "statics" string array property`);
  }
  if (!Array.isArray(definition.functions)) {
    throw new Error(`Definition ${definitionPath} missing or invalid "functions" string array property`);
  }
  copySources(appDest, definition);

  // This doesn't seem to be used, so shelve for now (PB: 12/7/2019)
  // fs.copySync('../../funcs/http/swagger/', `${sourceDirectory}/swagger`);

  // // Create swagger html
  // const swaggerDocumentPath = '../../funcs/http/swagger/api.yaml';
  // const swaggerDocument = YAML.load(swaggerDocumentPath);
  // const swaggerHTML = swagger.generateHTML(swaggerDocument);
  // fs.writeFileSync(path.resolve(sourceDirectory, 'http/api.html'), swaggerHTML);

  // Create output file stream
  const outputArchive = path.join(outputDirectory, '/', appName + '-func.zip');
  const output = fs.createWriteStream(outputArchive);

  // Create archive object
  const archive = archiver('zip', { zlib: { level: 9 } });

  // Create promise that resolves if archive completes successfully and rejects if it errors
  const archiveWritten = new Promise((resolve, reject) => {
    archive.on('error', reject); // (err) => reject(error)
    output.on('close', resolve);
  });

  // Subscribe to warnings and print them out
  archive.on('warning', (err) => {
    console.warn(`ARCHIVER WARN: ${err}`);
  });
  // Pipe the archive to the output file
  archive.pipe(output);

  // Add files to archive
  archive.directory(appDest, false);

  // Finalize archive and finish writing to disk
  archive.finalize();
  archiveWritten.then(() => {
    console.log(`Finished writing archive at ${new Date()}.`);
  });
};

// Make temporary sources directory
fs.emptyDirSync(sourceDirectory);

// Make output directory
try {
  fs.emptyDirSync(outputDirectory);
} catch (ex) {
  console.error(`Failed to create directory ${outputDirectory}`);
  throw Error('Cannot prepare deploy directory for azure func library');
}

// build a zip file to be deployed for each app.
for (const name of ['api', 'ingest', 'provision', 'shopapi']) {
  buildApp(name);
}
