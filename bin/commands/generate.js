"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResource = generateResource;
// src/commands/generate.ts
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fileUtils_1 = require("../utils/fileUtils");
const serviceTemplate_1 = require("../templates/serviceTemplate");
const controllerTemplate_1 = require("../templates/controllerTemplate");
const routerTemplate_1 = require("../templates/routerTemplate");
const modelTemplate_1 = require("../templates/modelTemplate");
const dynamic_router_update_1 = require("../utils/dynamic-router-update");
// import { generateServerTemplate } from '../templates/serverTemplate';
const typeMap = {
    string: 'String',
    int: 'Int',
    float: 'Float',
    boolean: 'Boolean',
    datetime: 'DateTime',
    json: 'Json',
    decimal: 'Decimal',
    bigint: 'BigInt',
    bytes: 'Bytes'
};
function isPrismaEnabled() {
    try {
        const configPath = path_1.default.join(process.cwd(), 'backendcli.config.json');
        const config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf-8'));
        return !!config.prisma;
    }
    catch {
        return false;
    }
}
async function generateResource() {
    console.log(chalk_1.default.magentaBright('\nWhat do you want to generate?'));
    const { type } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'type',
            message: chalk_1.default.cyan('Select resource type:'),
            choices: ['resource']
        }
    ]);
    if (type === 'resource')
        return generateFullResource();
}
async function generateFullResource() {
    const { resourceName } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'resourceName',
            message: chalk_1.default.cyan('Resource name (e.g., user, product):'),
            validate: input => !!input || 'Name cannot be empty'
        }
    ]);
    const { fields } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'fields',
            message: chalk_1.default.cyan('Enter fields (format: name:type,comma separated):'),
            validate: input => !!input || 'Fields cannot be empty'
        }
    ]);
    const { includeTest } = await inquirer_1.default.prompt([
        {
            type: 'confirm',
            name: 'includeTest',
            message: chalk_1.default.cyan('Generate test file?'),
            default: true
        }
    ]);
    const fieldsArr = fields.split(',').map((pair) => {
        const [name, rawType] = pair.trim().split(':');
        const optional = rawType.endsWith('?');
        const type = rawType.replace('?', '');
        return { name, type, optional };
    });
    const pascalName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
    const modelPath = path_1.default.join(process.cwd(), 'src', 'models', `${resourceName}.model.ts`);
    const servicePath = path_1.default.join(process.cwd(), 'src', 'services', `${resourceName}.service.ts`);
    const controllerPath = path_1.default.join(process.cwd(), 'src', 'controllers', `${resourceName}.controller.ts`);
    const routePath = path_1.default.join(process.cwd(), 'src', 'routes', `${resourceName}.route.ts`);
    const testPath = path_1.default.join(process.cwd(), 'test', `${resourceName}.test.ts`);
    // const appPath = path.join(process.cwd(), 'src', 'app.ts')
    // const serverPath = path.join(process.cwd(), 'src', 'server.ts')
    const modelTs = (0, modelTemplate_1.generateModelTemplate)(resourceName, pascalName, fieldsArr);
    const serviceTs = (0, serviceTemplate_1.generateServiceTemplate)(resourceName, pascalName);
    const controllerTs = (0, controllerTemplate_1.generateControllerTemplate)(resourceName, pascalName);
    const routeTs = (0, routerTemplate_1.generateRouterTemplate)(resourceName, pascalName);
    // const appTs = generateAppTemplate()
    // const serverTs = generateServerTemplate()
    const testTs = `describe('${pascalName} tests', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});`;
    await (0, fileUtils_1.writeFileRecursive)(modelPath, modelTs);
    await (0, fileUtils_1.writeFileRecursive)(servicePath, serviceTs);
    await (0, fileUtils_1.writeFileRecursive)(controllerPath, controllerTs);
    await (0, fileUtils_1.writeFileRecursive)(routePath, routeTs);
    // await writeFileRecursive(appPath, appTs)
    // await writeFileRecursive(serverPath, serverTs)
    (0, dynamic_router_update_1.updateRouterIndex)('user', path_1.default.join(process.cwd(), 'src', 'routes'));
    if (includeTest)
        await (0, fileUtils_1.writeFileRecursive)(testPath, testTs);
    if (isPrismaEnabled()) {
        const prismaPath = path_1.default.join(process.cwd(), 'prisma', 'schema.prisma');
        if (fs_1.default.existsSync(prismaPath)) {
            const modelFields = fieldsArr.map((f) => {
                const type = typeMap[f.type.toLowerCase()] || 'String';
                return `  ${f.name} ${type}${f.optional ? '?' : ''}`;
            });
            let idLine = '  id Int @id @default(autoincrement())';
            const hasId = fieldsArr.some((f) => f.name === 'id');
            if (hasId) {
                const idType = fieldsArr.find((f) => f.name === 'id')?.type.toLowerCase();
                if (idType === 'string')
                    idLine = '  id String @id @default(uuid())';
            }
            const model = `\nmodel ${pascalName} {\n${idLine}\n${modelFields.filter((f) => !f.includes(' id ')).join('\n')}\n}`;
            fs_1.default.appendFileSync(prismaPath, model);
            console.log(chalk_1.default.green(`\n✅ Prisma model '${pascalName}' appended to schema.prisma.`));
        }
    }
    console.log(chalk_1.default.green(`\n✅ Resource '${resourceName}' generated successfully.`));
}
