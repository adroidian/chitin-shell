import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const OPENCLAW_DIR = path.join(os.homedir(), '.openclaw');

export async function verifySetup({ system, answers, dryRun = false } = {}) {
  if (dryRun) {
    console.log(chalk.gray('  Would verify: config, gateway, channel connection'));
    console.log(chalk.green('  ✓ Verification complete (dry run)'));
    return;
  }

  const checks = [];

  // Check config exists
  const configSpinner = ora('Checking configuration...').start();
  try {
    await fs.access(path.join(OPENCLAW_DIR, 'openclaw.json'));
    configSpinner.succeed('Configuration file exists');
    checks.push(true);
  } catch {
    configSpinner.fail('Configuration file missing');
    checks.push(false);
  }

  // Check trust channels config
  const trustSpinner = ora('Checking trust channels...').start();
  try {
    await fs.access(path.join(OPENCLAW_DIR, 'workspace', 'chitin-trust-channels.yaml'));
    trustSpinner.succeed('Trust channels configured');
    checks.push(true);
  } catch {
    trustSpinner.fail('Trust channels config missing');
    checks.push(false);
  }

  // Check workspace files
  const wsSpinner = ora('Checking workspace...').start();
  try {
    await fs.access(path.join(OPENCLAW_DIR, 'workspace', 'SOUL.md'));
    await fs.access(path.join(OPENCLAW_DIR, 'workspace', 'AGENTS.md'));
    await fs.access(path.join(OPENCLAW_DIR, 'workspace', 'MEMORY.md'));
    wsSpinner.succeed('Workspace initialized (SOUL.md, AGENTS.md, MEMORY.md)');
    checks.push(true);
  } catch {
    wsSpinner.fail('Workspace files incomplete');
    checks.push(false);
  }

  // Check secrets permissions
  const secretsSpinner = ora('Checking secrets security...').start();
  try {
    const stats = await fs.stat(path.join(OPENCLAW_DIR, 'workspace', '.secrets'));
    const mode = (stats.mode & 0o777).toString(8);
    if (mode === '700') {
      secretsSpinner.succeed('Secrets directory secured (700)');
      checks.push(true);
    } else {
      secretsSpinner.warn(`Secrets directory permissions: ${mode} (should be 700)`);
      checks.push(false);
    }
  } catch {
    secretsSpinner.warn('Secrets directory not found');
    checks.push(false);
  }

  // Try starting the gateway
  const gwSpinner = ora('Testing gateway startup...').start();
  try {
    const { stdout } = await execa('openclaw', ['gateway', 'status'], { timeout: 10000 });
    if (stdout.includes('running')) {
      gwSpinner.succeed('Gateway is running');
    } else {
      gwSpinner.info('Gateway not running — start with: openclaw gateway start');
    }
    checks.push(true);
  } catch {
    gwSpinner.info('Gateway not running — start with: openclaw gateway start');
    checks.push(true); // Not a failure, just not started yet
  }

  // Summary
  const passed = checks.filter(Boolean).length;
  const total = checks.length;

  if (passed === total) {
    console.log(chalk.green(`\n  ✓ All ${total} checks passed`));
  } else {
    console.log(chalk.yellow(`\n  ⚠️  ${passed}/${total} checks passed`));
  }
}
