import fs from 'fs';
import path from 'path';

export function updateRouterIndex(resourceName: string, routesDir: string) {
  const pascalName = resourceName[0].toUpperCase() + resourceName.slice(1);
  const routeImport = `import ${resourceName}Routes from './${resourceName}.route';`;
  const routeUse = `router.use('/${resourceName}s', ${resourceName}Routes);`;

  const indexPath = path.join(routesDir, 'index.ts');

  if (!fs.existsSync(indexPath)) {
    const baseContent = `import { Router } from 'express';
${routeImport}

const router = Router();
${routeUse}

export default router;
`;
    fs.writeFileSync(indexPath, baseContent, 'utf-8');
    return;
  }

  let current = fs.readFileSync(indexPath, 'utf-8');

  if (!current.includes(routeImport)) {
    current = `${routeImport}\n` + current;
  }
  if (!current.includes(routeUse)) {
    current = current.replace(
      /const router = Router\(\);/,
      `const router = Router();\n${routeUse}`
    );
  }

  fs.writeFileSync(indexPath, current, 'utf-8');
}
