// src/__tests__/init.test.ts
import fs from 'fs';
import path from 'path';
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
  const configFile = path.join(process.cwd(), 'backendcli.config.json');

  beforeEach(() => {
    // Setup mock fs with required structure
    mock({
      [configFile]: '' // ensures path is mockable
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it('should create backendcli.config.json with correct content', async () => {
    await initModule.initProject();

    expect(fs.existsSync(configFile)).toBe(true);
    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

    expect(config).toEqual({
      name: 'test-app',
      prisma: true,
      testing: false,
    });
  });
});
