// This script sets up function packages for uploading to Azure

const fs = require('fs-extra');
const path = require('path');
//const {execSync} = require('child_process');
const archiver = require('archiver');
//const unzip = require('unzip');
const swagger = require('swagger-ui-express');
const YAML = require('yamljs');

const sourceDirectoy = './lib';
const outputArchive = path.resolve(__dirname, 'dist/azure-func.zip');
const outputDirectory = path.dirname(outputArchive);

// Initial clean up
if (fs.existsSync(sourceDirectoy)) {
  fs.removeSync(sourceDirectoy);
}

//copy over files...
fs.copySync('../../static/', sourceDirectoy);
fs.copySync('./pack/', sourceDirectoy);
fs.copySync('../../funcs/http/swagger/', `${sourceDirectoy}/swagger`);

// Create swagger html
const swaggerDocumentPath = '../../funcs/http/swagger/api.yaml';
const swaggerDocument = YAML.load(swaggerDocumentPath);
const swaggerHTML = swagger.generateHTML(swaggerDocument);
fs.writeFileSync(path.resolve(sourceDirectoy, 'http/api.html'), swaggerHTML);

// Make output directory
try {
  fs.mkdirSync(outputDirectory);
} catch (ex) {
} finally {
  if (!fs.existsSync(outputDirectory)) {
    console.error(`Failed to create directory ${outputDirectory}`);
    throw Error('Cannot prepare deploy directory for azure func library');
  }
}

// Create output file stream
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
archive.directory(sourceDirectoy, false);

// Finalize archive and finish writing to disk
archive.finalize();

//
archiveWritten.then(() => {
  console.log(`Finished writing archive at ${new Date()}.`);
});
