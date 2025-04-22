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
const child_process_1 = require("child_process");
const appTemplate_1 = require("../templates/appTemplate");
const serverTemplate_1 = require("../templates/serverTemplate");
const dbTemplate_1 = require("../templates/dbTemplate");
const appReadyTemplate_1 = require("../templates/appReadyTemplate");
const findallUtilTemplate_1 = __importDefault(require("../templates/findallUtilTemplate"));
const errorHandlerMiddleware_1 = require("../templates/errorHandlerMiddleware");
const wrapUtilTemplate_1 = require("../templates/wrapUtilTemplate");
async function initProject() {
    console.log(chalk_1.default.magentaBright('\nWelcome to Backend CLI Init 🚀'));
    const { projectName, database, useTesting } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: chalk_1.default.cyan('Project name:'),
            default: 'my-backend-app'
        },
        {
            type: 'list',
            name: 'database',
            message: chalk_1.default.cyan('Which database will you use?'),
            choices: ['MongoDB (Mongoose)', 'PostgreSQL (Prisma)', 'MySQL (Prisma)', 'SQLite (Prisma)', 'None'],
            default: 'MongoDB (Mongoose)'
        },
        {
            type: 'confirm',
            name: 'useTesting',
            message: chalk_1.default.cyan('Include test setup?'),
            default: true
        }
    ]);
    const usePrisma = database.includes('Prisma');
    const projectDir = path_1.default.join(process.cwd(), projectName);
    const srcDir = path_1.default.join(projectDir, 'src');
    const testDir = path_1.default.join(projectDir, 'test');
    const folders = [
        'controllers', 'jobs', 'middlewares', 'models',
        'routes', 'schedulers', 'services', 'config',
        'context', 'utils/prisma'
    ];
    fs_1.default.mkdirSync(projectDir, { recursive: true });
    fs_1.default.mkdirSync(srcDir, { recursive: true });
    fs_1.default.mkdirSync(testDir, { recursive: true });
    folders.forEach(f => fs_1.default.mkdirSync(path_1.default.join(srcDir, f), { recursive: true }));
    // Generate .env
    let dbURL = '';
    if (database.startsWith('MongoDB')) {
        dbURL = 'mongodb://localhost:27017/mydb';
    }
    else if (database.startsWith('PostgreSQL')) {
        dbURL = 'postgresql://user:password@localhost:5432/mydb';
    }
    else if (database.startsWith('MySQL')) {
        dbURL = 'mysql://user:password@localhost:3306/mydb';
    }
    else if (database.startsWith('SQLite')) {
        dbURL = 'file:./dev.db';
    }
    fs_1.default.writeFileSync(path_1.default.join(projectDir, '.env'), `PORT=5000\nDATABASE_URL=${dbURL}\n`);
    // backendcli config
    const config = { name: projectName, prisma: usePrisma, testing: useTesting };
    fs_1.default.writeFileSync(path_1.default.join(projectDir, 'backendcli.config.json'), JSON.stringify(config, null, 2));
    // tsconfig
    fs_1.default.writeFileSync(path_1.default.join(projectDir, 'tsconfig.json'), JSON.stringify({
        compilerOptions: {
            target: 'ES2020',
            module: 'CommonJS',
            outDir: 'dist',
            rootDir: 'src',
            strict: true,
            esModuleInterop: true,
            forceConsistentCasingInFileNames: true,
            skipLibCheck: true
        },
        include: ['src', 'test']
    }, null, 2));
    // nodemon.json
    fs_1.default.writeFileSync(path_1.default.join(projectDir, 'nodemon.json'), JSON.stringify({
        watch: ['src'],
        ext: 'ts',
        ignore: ['dist'],
        exec: 'ts-node src/server.ts'
    }, null, 2));
    // package.json
    const pkgJson = {
        name: projectName,
        version: '1.0.0',
        main: 'dist/server.js',
        scripts: {
            start: 'ts-node src/server.ts',
            generate: "prisma generate",
            dev: 'npm run generate && nodemon',
            build: 'tsc',
            test: 'jest'
        },
        dependencies: {
            express: '^4.18.2',
            cors: '^2.8.5',
            dotenv: '^16.3.1',
            morgan: '^1.10.0'
        },
        devDependencies: {
            "@types/cors": "^2.8.17",
            typescript: '^5.3.3',
            'ts-node': '^10.9.1',
            "@types/morgan": "^1.9.9",
            nodemon: '^3.0.1',
            '@types/node': '^20.10.5',
            '@types/express': '^4.17.21'
        }
    };
    if (useTesting) {
        Object.assign(pkgJson.devDependencies, {
            jest: '^29.7.0',
            'ts-jest': '^29.3.2',
            '@types/jest': '^29.5.14'
        });
    }
    if (usePrisma) {
        pkgJson.dependencies['@prisma/client'] = '^5.10.0';
        pkgJson.devDependencies['prisma'] = '^5.10.0';
    }
    else if (database.startsWith('MongoDB')) {
        pkgJson.dependencies['mongoose'] = '^7.6.1';
    }
    fs_1.default.writeFileSync(path_1.default.join(projectDir, 'package.json'), JSON.stringify(pkgJson, null, 2));
    // App files
    fs_1.default.writeFileSync(path_1.default.join(srcDir, 'app.ts'), (0, appTemplate_1.generateAppTemplate)());
    fs_1.default.writeFileSync(path_1.default.join(srcDir, 'server.ts'), (0, serverTemplate_1.generateServerTemplate)());
    fs_1.default.writeFileSync(path_1.default.join(srcDir, 'config', 'db.ts'), (0, dbTemplate_1.generateDbTemplate)(usePrisma));
    fs_1.default.writeFileSync(path_1.default.join(srcDir, 'context', 'appReady.ts'), (0, appReadyTemplate_1.generateAppReadyTemplate)());
    fs_1.default.writeFileSync(path_1.default.join(srcDir, 'utils', 'prisma', 'findAll.ts'), (0, findallUtilTemplate_1.default)());
    fs_1.default.writeFileSync(path_1.default.join(srcDir, 'middlewares', 'errorHandler.ts'), (0, errorHandlerMiddleware_1.generateerrorHandlerTemplate)());
    fs_1.default.writeFileSync(path_1.default.join(srcDir, 'utils', 'wrapAsync.ts'), (0, wrapUtilTemplate_1.generateWrapAsyncTemplate)());
    const routesIndex = `import { Router } from 'express';
const router = Router();
// router.use('/users', userRoutes);
export default router;`;
    fs_1.default.writeFileSync(path_1.default.join(srcDir, 'routes', 'index.ts'), routesIndex);
    console.log(chalk_1.default.green(`\n✅ Project '${projectName}' scaffolded and ready.`));
    if (usePrisma) {
        console.log(chalk_1.default.blue('\n📦 Installing dependencies & initializing Prisma...'));
        (0, child_process_1.execSync)('npm install', { cwd: projectDir, stdio: 'inherit' });
        (0, child_process_1.execSync)('npx prisma init', { cwd: projectDir, stdio: 'inherit' });
    }
    else {
        console.log(chalk_1.default.blue('\n📦 Installing dependencies...'));
        (0, child_process_1.execSync)('npm install', { cwd: projectDir, stdio: 'inherit' });
    }
    console.log(chalk_1.default.green(`\n🎉 Done! Run the app with:`));
    console.log(chalk_1.default.cyan(`cd ${projectName} && npm run dev`));
}
