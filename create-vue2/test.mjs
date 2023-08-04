import { fileURLToPath, URL } from 'node:url';
import fs from 'fs-extra';

const pkgJson = fs.readJsonSync(fileURLToPath(new URL('./package.json', import.meta.url)));
console.log('pkgJson: ', pkgJson);
