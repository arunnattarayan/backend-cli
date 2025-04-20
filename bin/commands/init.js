"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProject = initProject;
// src/commands/init.ts
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function initProject() {
    console.log(chalk_1.default.magentaBright('\nWelcome to Backend CLI Init 🚀'));
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: chalk_1.default.cyan('Project name:'),
            default: 'my-backend-app'
        },
        {
            type: 'confirm',
            name: 'usePrisma',
            message: chalk_1.default.cyan('Would you like to use Prisma?'),
            default: true
        },
        {
            type: 'confirm',
            name: 'useTesting',
            message: chalk_1.default.cyan('Should we include test case setup?'),
            default: true
        }
    ]);
    const config = {
        name: answers.projectName,
        prisma: answers.usePrisma,
        testing: answers.useTesting
    };
    const configPath = path_1.default.join(process.cwd(), 'backendcli.config.json');
    fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk_1.default.green(`\nProject '${config.name}' initialized.`));
    console.log(chalk_1.default.gray(`Config saved to backendcli.config.json\n`));
    if (answers.usePrisma) {
        console.log(chalk_1.default.blue('👉 Don’t forget to install Prisma:\n  npm install prisma --save-dev'));
    }
    if (answers.useTesting) {
        console.log(chalk_1.default.blue('👉 Suggested testing libs: npm install jest ts-jest @types/jest --save-dev\n'));
    }
}
