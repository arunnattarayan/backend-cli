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
const fileUtils_1 = require("../utils/fileUtils");
async function generateResource() {
    console.log(chalk_1.default.magentaBright('\nWhat do you want to generate?'));
    const { type } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'type',
            message: chalk_1.default.cyan('Select resource type:'),
            choices: ['resource', 'job', 'middleware', 'scheduler']
        }
    ]);
    if (type === 'resource')
        return generateFullResource();
    if (type === 'job')
        return generateJob();
    if (type === 'middleware')
        return generateMiddleware();
    if (type === 'scheduler')
        return generateScheduler();
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
        const [name, type] = pair.trim().split(':');
        return { name, type };
    });
    const pascalName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
    const baseDir = path_1.default.join(process.cwd(), 'src', resourceName);
    const files = [
        {
            path: path_1.default.join(baseDir, `${resourceName}.model.ts`),
            content: `export interface ${pascalName} {
        ${fieldsArr.map((f) => `  ${f.name}: ${f.type};`).join('\n')}
      }`
        },
        {
            path: path_1.default.join(baseDir, `${resourceName}.service.ts`),
            content: `export class ${pascalName}Service {
  constructor() {}
  // Add service methods
}`
        },
        {
            path: path_1.default.join(baseDir, `${resourceName}.controller.ts`),
            content: `import { ${pascalName}Service } from './${resourceName}.service';

export class ${pascalName}Controller {
  constructor(private service = new ${pascalName}Service()) {}
  // Add controller logic
}`
        },
        {
            path: path_1.default.join(baseDir, `${resourceName}.route.ts`),
            content: `import { Router } from 'express';
const router = Router();

// Define your routes here

export default router;`
        }
    ];
    if (includeTest) {
        files.push({
            path: path_1.default.join(baseDir, `${resourceName}.test.ts`),
            content: `describe('${pascalName} tests', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});`
        });
    }
    for (const file of files) {
        await (0, fileUtils_1.writeFileRecursive)(file.path, file.content);
    }
    console.log(chalk_1.default.green(`\n✅ Resource '${resourceName}' generated successfully.`));
}
async function generateJob() {
    const { name } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'name',
            message: chalk_1.default.cyan('Job name:'),
            validate: input => !!input || 'Name cannot be empty'
        }
    ]);
    const filePath = path_1.default.join(process.cwd(), 'src', 'jobs', `${name}.job.ts`);
    const content = `export const ${name}Job = async () => {
  console.log('Running ${name}Job...');
};`;
    await (0, fileUtils_1.writeFileRecursive)(filePath, content);
    console.log(chalk_1.default.green(`\n✅ Job '${name}' created.`));
}
async function generateMiddleware() {
    const { name } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'name',
            message: chalk_1.default.cyan('Middleware name:'),
            validate: input => !!input || 'Name cannot be empty'
        }
    ]);
    const filePath = path_1.default.join(process.cwd(), 'src', 'middlewares', `${name}.middleware.ts`);
    const content = `import { Request, Response, NextFunction } from 'express';

export const ${name}Middleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('${name} middleware hit');
  next();
};`;
    await (0, fileUtils_1.writeFileRecursive)(filePath, content);
    console.log(chalk_1.default.green(`\n✅ Middleware '${name}' created.`));
}
async function generateScheduler() {
    const { name } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'name',
            message: chalk_1.default.cyan('Scheduler name:'),
            validate: input => !!input || 'Name cannot be empty'
        }
    ]);
    const filePath = path_1.default.join(process.cwd(), 'src', 'schedulers', `${name}.scheduler.ts`);
    const content = `import cron from 'node-cron';

export function start${name.charAt(0).toUpperCase() + name.slice(1)}Scheduler() {
  cron.schedule('* * * * *', () => {
    console.log('${name} scheduler triggered');
  });
}`;
    await (0, fileUtils_1.writeFileRecursive)(filePath, content);
    console.log(chalk_1.default.green(`\n✅ Scheduler '${name}' created.`));
}
