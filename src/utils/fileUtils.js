import { readFile, writeFile } from 'fs/promises';

export async function readData(path) {
  const data = await readFile(path, 'utf-8');
  return JSON.parse(data);
}

export async function writeData(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2));
}
