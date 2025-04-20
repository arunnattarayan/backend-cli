"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/__tests__/init.test.ts
const fs_1 = __importDefault(require("fs"));
const mock_fs_1 = __importDefault(require("mock-fs"));
const initModule = __importStar(require("../commands/init"));
jest.mock('inquirer', () => ({
    prompt: jest.fn().mockResolvedValue({
        projectName: 'test-app',
        usePrisma: true,
        useTesting: false,
    }),
}));
describe('initProject()', () => {
    beforeEach(() => {
        (0, mock_fs_1.default)({});
    });
    afterEach(() => {
        mock_fs_1.default.restore();
    });
    it('should create backendcli.config.json with correct content', async () => {
        await initModule.initProject();
        const configPath = './backendcli.config.json';
        expect(fs_1.default.existsSync(configPath)).toBe(true);
        const config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf-8'));
        expect(config).toEqual({
            name: 'test-app',
            prisma: true,
            testing: false,
        });
    });
});
