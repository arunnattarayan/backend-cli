#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const init_1 = require("./commands/init");
const generate_1 = require("./commands/generate");
const program = new commander_1.Command();
program
    .name('backend-cli')
    .description(chalk_1.default.green('CLI to scaffold backend projects'))
    .version('1.0.0');
program
    .command('init')
    .description(chalk_1.default.blue('Initialize a backend project'))
    .action(async () => {
    await (0, init_1.initProject)();
});
program
    .command('generate')
    .description(chalk_1.default.yellow('Generate backend resources'))
    .action(async () => {
    await (0, generate_1.generateResource)();
});
program.parse();
