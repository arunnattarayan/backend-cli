// src/__tests__/init.test.ts
import fs from 'fs';
import mock from 'mock-fs';
import * as initModule from '../commands/init';

jest.mock('inquirer', () => ({
  prompt: jest.fn().mockResolvedValue({
    projectName: 'test-app',
    usePrisma: true,
    useTesting: false,
  }),
}));

describe('initProject()', () => {
  beforeEach(() => {
    mock({});
  });

  afterEach(() => {
    mock.restore();
  });

  it('should create backendcli.config.json with correct content', async () => {
    await initModule.initProject();

    const configPath = './backendcli.config.json';
    expect(fs.existsSync(configPath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    expect(config).toEqual({
      name: 'test-app',
      prisma: true,
      testing: false,
    });
  });
});
