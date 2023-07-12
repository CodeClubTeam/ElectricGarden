#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const files = fs
    .readdirSync(path.resolve(__dirname, '../build/static/js'))
    .map((file) => path.resolve(__dirname, `../build/static/js/${file}`));

const REACT_APP = /^REACT_APP_/i;

const env = Object.keys(process.env)
    .filter((key) => REACT_APP.test(key))
    .reduce((env, key) => {
        env[key] = process.env[key];
        return env;
    }, {});

console.log(
    `Replacing the following REACT_APP_ tokens found in the environment: %j`,
    env,
);

for (const file of files) {
    let content = fs.readFileSync(file, { encoding: 'UTF-8' });
    for (const [name, value] of Object.entries(env)) {
        const regex = new RegExp(`ZZZ_${name}_ZZZ`, 'g');
        content = content.replace(regex, value);
    }
    const leftOverMatches = content.match(/(ZZZ_REACT_APP_.*?_ZZZ)/g);
    if (leftOverMatches) {
        const deduped = [...new Set(leftOverMatches)];
        console.error('The following tokens found not replaced in output:');
        console.log('%j', deduped);
        process.exit(1);
    }
    fs.writeFileSync(file, content);
}
