import { PactV3 } from '@pact-foundation/pact';
import path from 'path';

export const provider = new PactV3({
  consumer: 'Frontend-Redecell',
  provider: 'Backend-Redecell',
  dir: path.resolve(process.cwd(), 'tests/contract/pacts'),
  log: path.resolve(process.cwd(), 'tests/contract/logs', 'pact.log'),
  logLevel: 'info',
});
