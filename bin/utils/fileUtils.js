"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFileRecursive = writeFileRecursive;
// src/utils/fileUtils.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function writeFileRecursive(filePath, content) {
    const dir = path_1.default.dirname(filePath);
    await fs_1.default.promises.mkdir(dir, { recursive: true });
    await fs_1.default.promises.writeFile(filePath, content, 'utf-8');
}
