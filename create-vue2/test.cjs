/* eslint-disable no-undef */

const path = require('path');
const fs = require('fs-extra');

const pkgJson = fs.readJsonSync(path.resolve(__dirname, 'package.json'));
console.log('pkgJson: ', pkgJson);
