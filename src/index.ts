// src/index.ts
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { initProject } from './commands/init';
import { generateResource } from './commands/generate';

const program = new Command();

program
  .name('backend-cli')
  .description(chalk.green('CLI to scaffold backend projects'))
  .version('1.0.0');

program
  .command('init')
  .description(chalk.blue('Initialize a backend project'))
  .action(async () => {
    await initProject();
  });

program
  .command('generate')
  .description(chalk.yellow('Generate backend resources'))
  .action(async () => {
    await generateResource();
  });

program.parse();
