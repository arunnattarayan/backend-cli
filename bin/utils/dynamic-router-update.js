"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRouterIndex = updateRouterIndex;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function updateRouterIndex(resourceName, routesDir) {
    const pascalName = resourceName[0].toUpperCase() + resourceName.slice(1);
    const routeImport = `import ${resourceName}Routes from './${resourceName}.route';`;
    const routeUse = `router.use('/${resourceName}s', ${resourceName}Routes);`;
    const indexPath = path_1.default.join(routesDir, 'index.ts');
    if (!fs_1.default.existsSync(indexPath)) {
        const baseContent = `import { Router } from 'express';
${routeImport}

const router = Router();
${routeUse}

export default router;
`;
        fs_1.default.writeFileSync(indexPath, baseContent, 'utf-8');
        return;
    }
    let current = fs_1.default.readFileSync(indexPath, 'utf-8');
    if (!current.includes(routeImport)) {
        current = `${routeImport}\n` + current;
    }
    if (!current.includes(routeUse)) {
        current = current.replace(/const router = Router\(\);/, `const router = Router();\n${routeUse}`);
    }
    fs_1.default.writeFileSync(indexPath, current, 'utf-8');
}
