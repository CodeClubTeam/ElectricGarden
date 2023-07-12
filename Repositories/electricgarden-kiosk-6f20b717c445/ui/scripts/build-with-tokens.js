#!/usr/bin/env node

// because the static build output files have hashed filenames they don't need CDN purge and can
// be cached indefinitely by proxy servers and browsers
// but we then modify them when applying configuration (apply-configuration.js)
// without updating the hash so if deployment settings change they will be different but the cache+CDN
// won't be up to date
// so this script puts a suffix on the end of the tokens

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const appFolder = process.argv[2];
if (!appFolder) {
    console.error(`Usage: ${process.argv[1]} <react-app-dir-name>`);
    process.exit(1);
}

const appFolderPath = path.resolve('./', appFolder);
if (!fs.existsSync(appFolderPath)) {
    console.error(`Cannot find react app folder: ${appFolderPath}.`);
    process.exit(1);
}

require('dotenv').config({
    path: path.resolve(appFolderPath, './.env.production'),
});

const tokenSuffix = process.argv[3] || '';

const REACT_APP = /^REACT_APP_/i;

const EXCLUDED_TOKENS = [];

const suffixedReactAppEnv = Object.keys(process.env)
    .filter((key) => REACT_APP.test(key))
    .filter((key) => !EXCLUDED_TOKENS.includes(key))
    .reduce((env, key) => {
        env[key] = process.env[key].replace('}}', tokenSuffix + '}}');
        return env;
    }, {});

console.log('Using follow tokens in output:');
console.log('%j', suffixedReactAppEnv);

const buildScript = fs.existsSync(
    path.resolve(appFolder, './node_modules/.bin/craco'),
)
    ? 'craco'
    : 'react-scripts';

const build = child_process.spawn(
    'node',
    [`node_modules/.bin/${buildScript}`, 'build'],
    { env: { ...process.env, ...suffixedReactAppEnv }, cwd: appFolder },
);
build.stdout.setEncoding('utf8');
build.stdout.on('data', (data) => {
    console.log(data.toString());
});
build.stderr.on('data', (data) => {
    console.error(data.toString());
});
build.on('error', (err) => {
    console.error(err);
    process.exit(1);
});
build.on('exit', (code, _signal) => {
    process.exit(code);
});
