// src/commands/init.ts
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export async function initProject() {
  console.log(chalk.magentaBright('\nWelcome to Backend CLI Init 🚀'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: chalk.cyan('Project name:'),
      default: 'my-backend-app'
    },
    {
      type: 'confirm',
      name: 'usePrisma',
      message: chalk.cyan('Would you like to use Prisma?'),
      default: true
    },
    {
      type: 'confirm',
      name: 'useTesting',
      message: chalk.cyan('Should we include test case setup?'),
      default: true
    }
  ]);

  const config = {
    name: answers.projectName,
    prisma: answers.usePrisma,
    testing: answers.useTesting
  };

  const configPath = path.join(process.cwd(), 'backendcli.config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(chalk.green(`\nProject '${config.name}' initialized.`));
  console.log(chalk.gray(`Config saved to backendcli.config.json\n`));

  if (answers.usePrisma) {
    console.log(chalk.blue('👉 Don’t forget to install Prisma:\n  npm install prisma --save-dev'));
  }

  if (answers.useTesting) {
    console.log(chalk.blue('👉 Suggested testing libs: npm install jest ts-jest @types/jest --save-dev\n'));
  }
}
