import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';

export async function hardenSecurity({ system, answers, dryRun = false } = {}) {
  if (!system.isLinux) {
    console.log(chalk.gray('  Skipping Linux-specific hardening (not Linux)'));
    console.log(chalk.green('  ✓ Security hardening skipped (non-Linux)'));
    return;
  }

  if (dryRun) {
    console.log(chalk.gray('  Would configure: UFW firewall, fail2ban, file permissions'));
    console.log(chalk.green('  ✓ Security hardening complete (dry run)'));
    return;
  }

  // UFW Firewall
  if (system.hasSudo) {
    const ufwSpinner = ora('Configuring firewall (UFW)...').start();
    try {
      // Check if UFW is installed
      await execa('which', ['ufw']);

      // Set defaults
      await execa('sudo', ['ufw', 'default', 'deny', 'incoming']);
      await execa('sudo', ['ufw', 'default', 'allow', 'outgoing']);

      // Allow SSH
      await execa('sudo', ['ufw', 'allow', '22/tcp']);

      // Allow Tailscale subnet if Tailscale is present
      if (system.hasTailscale) {
        await execa('sudo', ['ufw', 'allow', 'in', 'on', 'tailscale0']);
      }

      // Enable (non-interactive)
      await execa('sudo', ['ufw', '--force', 'enable']);
      ufwSpinner.succeed('Firewall configured (deny incoming, allow SSH + Tailscale)');
    } catch (err) {
      ufwSpinner.warn('UFW not available or failed — configure firewall manually');
    }

    // Fail2ban
    const f2bSpinner = ora('Configuring fail2ban...').start();
    try {
      await execa('which', ['fail2ban-client']);
      // Check if already running
      try {
        await execa('sudo', ['fail2ban-client', 'status']);
        f2bSpinner.succeed('fail2ban already active');
      } catch {
        await execa('sudo', ['systemctl', 'enable', '--now', 'fail2ban']);
        f2bSpinner.succeed('fail2ban enabled');
      }
    } catch {
      // Try to install
      try {
        await execa('sudo', ['apt-get', 'install', '-y', 'fail2ban'], { timeout: 60000 });
        await execa('sudo', ['systemctl', 'enable', '--now', 'fail2ban']);
        f2bSpinner.succeed('fail2ban installed and enabled');
      } catch {
        f2bSpinner.warn('fail2ban not available — install manually: sudo apt install fail2ban');
      }
    }
  } else {
    console.log(chalk.yellow('  ⚠️  No sudo access — skipping firewall and fail2ban'));
    console.log(chalk.gray('    Run manually:'));
    console.log(chalk.gray('    sudo ufw default deny incoming'));
    console.log(chalk.gray('    sudo ufw allow 22/tcp'));
    console.log(chalk.gray('    sudo ufw --force enable'));
    console.log(chalk.gray('    sudo apt install -y fail2ban'));
  }

  // File permissions on secrets
  const secretsSpinner = ora('Securing file permissions...').start();
  try {
    const home = process.env.HOME;
    await execa('chmod', ['700', `${home}/.openclaw/workspace/.secrets`]);
    secretsSpinner.succeed('Secrets directory secured (700)');
  } catch {
    secretsSpinner.warn('Could not set secrets permissions');
  }

  console.log(chalk.green('  ✓ Security hardening complete'));
}
