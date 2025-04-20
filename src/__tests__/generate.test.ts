// src/__tests__/generate.test.ts
import fs from 'fs';
import mock from 'mock-fs';
import * as gen from '../commands/generate';

jest.mock('inquirer', () => ({
  prompt: jest
    .fn()
    .mockResolvedValueOnce({ type: 'resource' }) // menu choice
    .mockResolvedValueOnce({ resourceName: 'user' })
    .mockResolvedValueOnce({ fields: 'name:string,age:number' })
    .mockResolvedValueOnce({ includeTest: true }),
}));

describe('generateResource()', () => {
  beforeEach(() => {
    mock({});
  });

  afterEach(() => {
    mock.restore();
  });

  it('should generate resource files in correct location', async () => {
    await gen.generateResource();

    const base = './src/user';
    expect(fs.existsSync(`${base}/user.model.ts`)).toBe(true);
    expect(fs.existsSync(`${base}/user.service.ts`)).toBe(true);
    expect(fs.existsSync(`${base}/user.controller.ts`)).toBe(true);
    expect(fs.existsSync(`${base}/user.route.ts`)).toBe(true);
    expect(fs.existsSync(`${base}/user.test.ts`)).toBe(true);
  });
});
