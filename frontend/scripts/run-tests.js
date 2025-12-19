import { glob } from 'glob';
import { execa } from 'execa';

async function runTests() {
  const testFiles = await glob('src/**/*.test.tsx', { cwd: process.cwd() });

  for (const file of testFiles) {
    console.log(`Running test: ${file}`);
    try {
      await execa('npx', ['vitest', '--run', file], { stdio: 'inherit' });
    } catch (error) {
      console.error(`Test failed: ${file}`);
      process.exit(1);
    }
  }
  console.log('All tests passed!');
}

runTests();
