#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const folderName = process.argv[2];
if (!folderName) {
    console.error(`Usage: ${process.argv[1]} <dir-name> [<build-number>]`);
    process.exit(1);
}
const tokenSuffix = process.argv[3] || '';

const folderPath = path.resolve('./', folderName);
if (!fs.existsSync(folderPath)) {
    console.error(`Cannot find folder: ${folderPath}.`);
    process.exit(1);
}

// NOTE: only one level deep
const files = fs
    .readdirSync(path.resolve(folderPath, './build/static/js'), {
        withFileTypes: true,
    })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map(({ name }) => path.resolve(folderPath, `./build/static/js/${name}`));

const htmlFile = path.resolve(folderPath, './build/index.html');
files.push(htmlFile);

const REACT_APP = /^REACT_APP_/i;

const EXCLUDED_TOKENS = [];

const env = Object.keys(process.env)
    .filter((key) => REACT_APP.test(key))
    .filter((key) => !EXCLUDED_TOKENS.includes(key))
    .reduce((env, key) => {
        env[key] = process.env[key];
        return env;
    }, {});

console.log(
    `Replacing the following REACT_APP_ tokens found in the environment: %j`,
    env,
);
if (tokenSuffix) {
    console.log(
        `Using token suffix: ${tokenSuffix} e.g. {{REACT_APP_XYZ${tokenSuffix}}}`,
    );
}

for (const file of files) {
    let content = fs.readFileSync(file, { encoding: 'UTF-8' });
    for (const [name, value] of Object.entries(env)) {
        const regex = new RegExp(`{{${name}${tokenSuffix}}}`, 'g');
        content = content.replace(regex, value);
    }
    const leftOverMatches = content.match(/(\{\{REACT_APP_.*?\}\})/g);
    if (leftOverMatches) {
        const deduped = [...new Set(leftOverMatches)];
        console.error('The following tokens found not replaced in output:');
        console.log('%j', deduped);
        process.exit(1);
    }
    fs.writeFileSync(file, content);
}
