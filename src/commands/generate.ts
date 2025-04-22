// src/commands/generate.ts
import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { writeFileRecursive, toPascalCase } from '../utils/fileUtils';


import { generateServiceTemplate } from '../templates/serviceTemplate';
import { generateControllerTemplate } from '../templates/controllerTemplate';
import { generateRouterTemplate } from '../templates/routerTemplate';
import { generateModelTemplate } from '../templates/modelTemplate';
import { updateRouterIndex } from '../utils/dynamic-router-update';
// import { generateServerTemplate } from '../templates/serverTemplate';

const typeMap: Record<string, string> = {
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

function isPrismaEnabled(): boolean {
  try {
    const configPath = path.join(process.cwd(), 'backendcli.config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return !!config.prisma;
  } catch {
    return false;
  }
}

export async function generateResource() {
  console.log(chalk.magentaBright('\nWhat do you want to generate?'));

  const { type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: chalk.cyan('Select resource type:'),
      choices: ['resource']
    }
  ]);

  if (type === 'resource') return generateFullResource();
}

async function generateFullResource() {
  const { resourceName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'resourceName',
      message: chalk.cyan('Resource name (e.g., user, product):'),
      validate: input => !!input || 'Name cannot be empty'
    }
  ]);

  const { fields } = await inquirer.prompt([
    {
      type: 'input',
      name: 'fields',
      message: chalk.cyan('Enter fields (format: name:type,comma separated):'),
      validate: input => !!input || 'Fields cannot be empty'
    }
  ]);

  const { includeTest } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'includeTest',
      message: chalk.cyan('Generate test file?'),
      default: true
    }
  ]);

  const fieldsArr = fields.split(',').map((pair: string) => {
    const [name, rawType] = pair.trim().split(':');
    const optional = rawType.endsWith('?');
    const type = rawType.replace('?', '');
    return { name, type, optional };
  });


  const pascalName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
  const modelPath = path.join(process.cwd(), 'src', 'models', `${resourceName}.model.ts`);
  const servicePath = path.join(process.cwd(), 'src', 'services', `${resourceName}.service.ts`);
  const controllerPath = path.join(process.cwd(), 'src', 'controllers', `${resourceName}.controller.ts`);
  const routePath = path.join(process.cwd(), 'src', 'routes', `${resourceName}.route.ts`);
  const testPath = path.join(process.cwd(), 'test', `${resourceName}.test.ts`);
  // const appPath = path.join(process.cwd(), 'src', 'app.ts')
  // const serverPath = path.join(process.cwd(), 'src', 'server.ts')

  const modelTs = generateModelTemplate(resourceName, pascalName, fieldsArr);
  const serviceTs = generateServiceTemplate(resourceName, pascalName);
  const controllerTs = generateControllerTemplate(resourceName, pascalName);
  const routeTs = generateRouterTemplate(resourceName, pascalName);
  // const appTs = generateAppTemplate()
  // const serverTs = generateServerTemplate()
  const testTs = `describe('${pascalName} tests', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});`;

  await writeFileRecursive(modelPath, modelTs);
  await writeFileRecursive(servicePath, serviceTs);
  await writeFileRecursive(controllerPath, controllerTs);
  await writeFileRecursive(routePath, routeTs);
  // await writeFileRecursive(appPath, appTs)
  // await writeFileRecursive(serverPath, serverTs)
  updateRouterIndex('user', path.join(process.cwd(), 'src', 'routes'));

  if (includeTest) await writeFileRecursive(testPath, testTs);
  if (isPrismaEnabled()) {
    const prismaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    if (fs.existsSync(prismaPath)) {
      const modelFields = fieldsArr.map((f: { type: string; name: any; optional: any; }) => {
        const type = typeMap[f.type.toLowerCase()] || 'String';
        return `  ${f.name} ${type}${f.optional ? '?' : ''}`;
      });
      let idLine = '  id Int @id @default(autoincrement())';
      const hasId = fieldsArr.some((f: { name: string; }) => f.name === 'id');
      if (hasId) {
        const idType = fieldsArr.find((f: { name: string; }) => f.name === 'id')?.type.toLowerCase();
        if (idType === 'string') idLine = '  id String @id @default(uuid())';
      }
      const model = `\nmodel ${pascalName} {\n${idLine}\n${modelFields.filter((f: string | string[]) => !f.includes(' id ')).join('\n')}\n}`;
      fs.appendFileSync(prismaPath, model);
      console.log(chalk.green(`\n✅ Prisma model '${pascalName}' appended to schema.prisma.`));
    }
  }

  console.log(chalk.green(`\n✅ Resource '${resourceName}' generated successfully.`));
}
