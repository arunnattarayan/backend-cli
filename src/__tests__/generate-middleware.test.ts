// src/__tests__/generate-middleware.test.ts
import fs from 'fs';
import mock from 'mock-fs';
import * as gen from '../commands/generate';

jest.mock('inquirer', () => ({
  prompt: jest
    .fn()
    .mockResolvedValueOnce({ type: 'middleware' })
    .mockResolvedValueOnce({ name: 'authCheck' }),
}));

describe('generateMiddleware()', () => {
  beforeEach(() => mock({}));
  afterEach(() => mock.restore());

  it('should create a middleware file with correct export', async () => {
    await gen.generateResource();
    const filePath = './src/middlewares/authCheck.middleware.ts';
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('authCheckMiddleware');
  });
});
