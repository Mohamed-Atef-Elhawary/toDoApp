import fs from 'fs';
import path from 'path';

const dirPath = path.join(process.cwd(), 'src', 'environments');
const envFile = path.join(dirPath, 'environment.ts');
const envDevFile = path.join(dirPath, 'environment.development.ts');

const binId = process.env.binId;
const masterKey = process.env.masterKey;
const backendUrl = process.env.backendUrl;

const content = `export const environment = {
binId:"${binId}",
masterKey:"${masterKey}",
backendUrl:"${backendUrl}",
};`;

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

fs.writeFileSync(envFile, content);
fs.writeFileSync(envDevFile, content);

console.log('Environments created successfully!');
