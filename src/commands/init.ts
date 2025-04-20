// src/commands/init.ts
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export async function initProject() {
  console.log(chalk.magentaBright('\nWelcome to Backend CLI Init 🚀'));

  const { projectName, database, useTesting } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: chalk.cyan('Project name:'),
      default: 'my-backend-app'
    },
    {
      type: 'list',
      name: 'database',
      message: chalk.cyan('Which database will you use?'),
      choices: ['MongoDB (Mongoose)', 'PostgreSQL (Prisma)', 'MySQL (Prisma)', 'SQLite (Prisma)', 'None'],
      default: 'MongoDB (Mongoose)'
    },
    {
      type: 'confirm',
      name: 'useTesting',
      message: chalk.cyan('Include test setup?'),
      default: true
    }
  ]);

  const usePrisma = database.includes('Prisma');
  const projectDir = path.join(process.cwd(), projectName);
  const srcDir = path.join(projectDir, 'src');
  const testDir = path.join(projectDir, 'test');

  const folders = [
    'controllers', 'jobs', 'middlewares', 'models',
    'routes', 'schedulers', 'services', 'config'
  ];

  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(srcDir, { recursive: true });
  fs.mkdirSync(testDir, { recursive: true });
  folders.forEach(f => fs.mkdirSync(path.join(srcDir, f), { recursive: true }));

  // Generate .env
  let dbURL = '';
  if (database.startsWith('MongoDB')) {
    dbURL = 'mongodb://localhost:27017/mydb';
  } else if (database.startsWith('PostgreSQL')) {
    dbURL = 'postgresql://user:password@localhost:5432/mydb';
  } else if (database.startsWith('MySQL')) {
    dbURL = 'mysql://user:password@localhost:3306/mydb';
  } else if (database.startsWith('SQLite')) {
    dbURL = 'file:./dev.db';
  }

  fs.writeFileSync(path.join(projectDir, '.env'), `PORT=5000\nDATABASE_URL=${dbURL}\n`);

  // backendcli config
  const config = { name: projectName, prisma: usePrisma, testing: useTesting };
  fs.writeFileSync(path.join(projectDir, 'backendcli.config.json'), JSON.stringify(config, null, 2));

  // tsconfig
  fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), JSON.stringify({
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
  fs.writeFileSync(path.join(projectDir, 'nodemon.json'), JSON.stringify({
    watch: ['src'],
    ext: 'ts',
    ignore: ['dist'],
    exec: 'ts-node src/server.ts'
  }, null, 2));

  // package.json
  const pkgJson: Record<string, any> = {
    name: projectName,
    version: '1.0.0',
    main: 'dist/server.js',
    scripts: {
      start: 'ts-node src/server.ts',
      dev: 'nodemon',
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
      typescript: '^5.3.3',
      'ts-node': '^10.9.1',
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
  } else if (database.startsWith('MongoDB')) {
    pkgJson.dependencies['mongoose'] = '^7.6.1';
  }

  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

  // App files
  const appTs = `import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import routes from './routes';
${usePrisma ? "import { prisma } from './config/db';" : "import { connectDB } from './config/db';"}

dotenv.config();
${usePrisma ? '' : 'connectDB();'}

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', routes);
app.get('/', (req, res) => res.send('API is healthy ✅'));

export default app;`;
  fs.writeFileSync(path.join(srcDir, 'app.ts'), appTs);

  const serverTs = `import app from './app';
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` + '`🚀 Server running at http://localhost:${PORT}`' + `);
});`;
  fs.writeFileSync(path.join(srcDir, 'server.ts'), serverTs);

  const dbTs = usePrisma
    ? `import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();`
    : `import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL || '', {});
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};`;
  fs.writeFileSync(path.join(srcDir, 'config', 'db.ts'), dbTs);

  const routesIndex = `import { Router } from 'express';
const router = Router();
// router.use('/users', userRoutes);
export default router;`;
  fs.writeFileSync(path.join(srcDir, 'routes', 'index.ts'), routesIndex);

  console.log(chalk.green(`\n✅ Project '${projectName}' scaffolded and ready.`));

  if (usePrisma) {
    console.log(chalk.blue('\n📦 Installing dependencies & initializing Prisma...'));
    execSync('npm install', { cwd: projectDir, stdio: 'inherit' });
    execSync('npx prisma init', { cwd: projectDir, stdio: 'inherit' });
  } else {
    console.log(chalk.blue('\n📦 Installing dependencies...'));
    execSync('npm install', { cwd: projectDir, stdio: 'inherit' });
  }

  console.log(chalk.green(`\n🎉 Done! Run the app with:`));
  console.log(chalk.cyan(`cd ${projectName} && npm run dev`));
}
