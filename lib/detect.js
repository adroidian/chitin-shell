import chalk from 'chalk';
import { execaSync } from 'execa';
import os from 'os';

export async function detectSystem({ dryRun = false } = {}) {
  const system = {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: Math.round(os.totalmem() / 1024 / 1024 / 1024),
    hostname: os.hostname(),
    user: os.userInfo().username,
    nodeVersion: null,
    npmVersion: null,
    hasDocker: false,
    hasTailscale: false,
    hasOllama: false,
    hasSudo: false,
    isLinux: os.platform() === 'linux',
    isMac: os.platform() === 'darwin',
  };

  // Check Node
  try {
    const { stdout } = execaSync('node', ['--version']);
    system.nodeVersion = stdout.trim();
  } catch { /* not found */ }

  // Check npm
  try {
    const { stdout } = execaSync('npm', ['--version']);
    system.npmVersion = stdout.trim();
  } catch { /* not found */ }

  // Check Docker
  try {
    execaSync('docker', ['--version']);
    system.hasDocker = true;
  } catch { /* not found */ }

  // Check Tailscale
  try {
    execaSync('tailscale', ['version']);
    system.hasTailscale = true;
  } catch { /* not found */ }

  // Check Ollama
  try {
    execaSync('ollama', ['--version']);
    system.hasOllama = true;
  } catch { /* not found */ }

  // Check sudo
  try {
    execaSync('sudo', ['-n', 'true']);
    system.hasSudo = true;
  } catch { /* no passwordless sudo */ }

  // Display results
  console.log(chalk.white('  System detected:'));
  console.log(chalk.gray(`    OS:        ${system.platform} (${system.arch})`));
  console.log(chalk.gray(`    Hostname:  ${system.hostname}`));
  console.log(chalk.gray(`    CPUs:      ${system.cpus} cores`));
  console.log(chalk.gray(`    Memory:    ${system.memory} GB`));
  console.log(chalk.gray(`    Node:      ${system.nodeVersion || chalk.red('NOT FOUND')}`));
  console.log(chalk.gray(`    npm:       ${system.npmVersion || chalk.red('NOT FOUND')}`));
  console.log(chalk.gray(`    Docker:    ${system.hasDocker ? chalk.green('✓') : chalk.yellow('not found')}`));
  console.log(chalk.gray(`    Tailscale: ${system.hasTailscale ? chalk.green('✓') : chalk.yellow('not found')}`));
  console.log(chalk.gray(`    Ollama:    ${system.hasOllama ? chalk.green('✓') : chalk.yellow('not found')}`));

  // Minimum requirements
  if (!system.nodeVersion) {
    throw new Error('Node.js is required. Install it: https://nodejs.org');
  }

  const major = parseInt(system.nodeVersion.replace('v', ''));
  if (major < 18) {
    throw new Error(`Node.js 18+ required (found ${system.nodeVersion}). Update: https://nodejs.org`);
  }

  if (system.memory < 2) {
    console.log(chalk.yellow(`\n  ⚠️  Low memory (${system.memory}GB). Recommended: 4GB+`));
  }

  console.log(chalk.green('\n  ✓ System requirements met'));
  return system;
}
