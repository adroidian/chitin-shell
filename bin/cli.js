#!/usr/bin/env node

import { bootstrap } from '../lib/bootstrap.js';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

bootstrap({ dryRun }).catch((err) => {
  console.error('\n❌ Bootstrap failed:', err.message);
  process.exit(1);
});
