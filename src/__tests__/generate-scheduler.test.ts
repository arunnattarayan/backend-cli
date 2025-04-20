// src/__tests__/generate-scheduler.test.ts
import fs from 'fs';
import mock from 'mock-fs';
import * as gen from '../commands/generate';

jest.mock('inquirer', () => ({
  prompt: jest
    .fn()
    .mockResolvedValueOnce({ type: 'scheduler' })
    .mockResolvedValueOnce({ name: 'backup' }),
}));

describe('generateScheduler()', () => {
  beforeEach(() => mock({}));
  afterEach(() => mock.restore());

  it('should create a scheduler file that starts with cron', async () => {
    await gen.generateResource();
    const filePath = './src/schedulers/backup.scheduler.ts';
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain("cron.schedule");
    expect(content).toContain("startBackupScheduler");
  });
});
