// src/utils/fileUtils.ts
import fs from 'fs';
import path from 'path';

export async function writeFileRecursive(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(filePath, content, 'utf-8');
}
