import { readFileSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { globSync } from 'glob';

const SRC_DIR = join(__dirname, '..');

const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  '__tests__',
  '.test.',
  '.spec.',
  'scripts/',
  'lib/logger.ts',
  'lib/logger-server.ts',
  'lib/utils.ts',
];

function shouldExclude(filePath: string): boolean {
  const rel = relative(SRC_DIR, filePath);
  return EXCLUDE_PATTERNS.some(p => rel.includes(p));
}

const FORBIDDEN_PATTERN = /e\s+instanceof\s+Error\s*\?\s*e\.message\s*:\s*String\(e\)/;

describe('getErrorMessage usage audit', () => {
  const files = globSync('**/*.{ts,tsx}', { cwd: SRC_DIR, ignore: 'node_modules/**' })
    .map(f => join(SRC_DIR, f))
    .filter(f => !shouldExclude(f));

  const violations: string[] = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (FORBIDDEN_PATTERN.test(lines[i])) {
        violations.push(`${relative(SRC_DIR, file)}:${i + 1}`);
      }
    }
  }

  it('must have zero inline getErrorMessage patterns', () => {
    if (violations.length > 0) {
      throw new Error(
        `Found ${violations.length} inline \`e instanceof Error ? e.message : String(e)\` patterns:\n` +
        violations.map(v => `  - ${v}`).join('\n') +
        '\nReplace with `getErrorMessage(e)` from @/lib/utils'
      );
    }
  });
});
