// src/commands/generate.ts
import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { writeFileRecursive } from '../utils/fileUtils';

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
      choices: ['resource', 'job', 'middleware', 'scheduler']
    }
  ]);

  if (type === 'resource') return generateFullResource();
  if (type === 'job') return generateJob();
  if (type === 'middleware') return generateMiddleware();
  if (type === 'scheduler') return generateScheduler();
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
    const [name, type] = pair.trim().split(':');
    return { name, type };
  });

  const pascalName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
  const baseDir = path.join(process.cwd(), 'src', resourceName);

  const files = [
    {
      path: path.join(baseDir, `${resourceName}.model.ts`),
      content: `export interface ${pascalName} {
${fieldsArr.map((f: { name: string, type: string }) => `  ${f.name}: ${f.type};`).join('\n')}
}`
    },
    {
      path: path.join(baseDir, `${resourceName}.service.ts`),
      content: `export class ${pascalName}Service {
  constructor() {}
  // Add service methods
}`
    },
    {
      path: path.join(baseDir, `${resourceName}.controller.ts`),
      content: `import { ${pascalName}Service } from './${resourceName}.service';

export class ${pascalName}Controller {
  constructor(private service = new ${pascalName}Service()) {}
  // Add controller logic
}`
    },
    {
      path: path.join(baseDir, `${resourceName}.route.ts`),
      content: `import { Router } from 'express';
const router = Router();

// Define your routes here

export default router;`
    }
  ];

  if (includeTest) {
    files.push({
      path: path.join(baseDir, `${resourceName}.test.ts`),
      content: `describe('${pascalName} tests', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});`
    });
  }

  for (const file of files) {
    await writeFileRecursive(file.path, file.content);
  }

  // Only if Prisma is enabled, append schema
  if (isPrismaEnabled()) {
    const prismaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    if (fs.existsSync(prismaPath)) {
      const modelFields = fieldsArr.map((f: { name: string, type: string }) => {
        const prismaType = typeMap[f.type.toLowerCase()] || 'String';
        return `  ${f.name} ${prismaType}`;
      });
      const model = `\nmodel ${pascalName} {\n  id Int @id @default(autoincrement())\n${modelFields.join('\n')}\n}`;
      fs.appendFileSync(prismaPath, model);
      console.log(chalk.green(`\n✅ Prisma model '${pascalName}' appended to schema.prisma.`));
    }
  }

  console.log(chalk.green(`\n✅ Resource '${resourceName}' generated successfully.`));
}

async function generateJob() {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: chalk.cyan('Job name:'),
      validate: input => !!input || 'Name cannot be empty'
    }
  ]);

  const filePath = path.join(process.cwd(), 'src', 'jobs', `${name}.job.ts`);
  const content = `export const ${name}Job = async () => {
  console.log('Running ${name}Job...');
};`;

  await writeFileRecursive(filePath, content);
  console.log(chalk.green(`\n✅ Job '${name}' created.`));
}

async function generateMiddleware() {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: chalk.cyan('Middleware name:'),
      validate: input => !!input || 'Name cannot be empty'
    }
  ]);

  const filePath = path.join(process.cwd(), 'src', 'middlewares', `${name}.middleware.ts`);
  const content = `import { Request, Response, NextFunction } from 'express';

export const ${name}Middleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('${name} middleware hit');
  next();
};`;

  await writeFileRecursive(filePath, content);
  console.log(chalk.green(`\n✅ Middleware '${name}' created.`));
}

async function generateScheduler() {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: chalk.cyan('Scheduler name:'),
      validate: input => !!input || 'Name cannot be empty'
    }
  ]);

  const filePath = path.join(process.cwd(), 'src', 'schedulers', `${name}.scheduler.ts`);
  const content = `import cron from 'node-cron';

export function start${name.charAt(0).toUpperCase() + name.slice(1)}Scheduler() {
  cron.schedule('* * * * *', () => {
    console.log('${name} scheduler triggered');
  });
}`;

  await writeFileRecursive(filePath, content);
  console.log(chalk.green(`\n✅ Scheduler '${name}' created.`));
}
