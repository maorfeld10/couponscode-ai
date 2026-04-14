import { inngest } from './inngest';

// Real adapters and scheduled functions land in Day 3.
// This file currently exists so pnpm typecheck passes.

export { inngest };

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('ingestion service scaffold - no jobs registered yet');
}
