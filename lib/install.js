import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';

export async function installOpenClaw({ system, answers, dryRun = false } = {}) {
  // Check if OpenClaw is already installed
  let installed = false;
  try {
    const { stdout } = await execa('openclaw', ['--version']);
    console.log(chalk.gray(`  OpenClaw already installed: ${stdout.trim()}`));
    installed = true;
  } catch { /* not installed */ }

  if (!installed) {
    const spinner = ora('Installing OpenClaw...').start();
    if (dryRun) {
      spinner.succeed('Would install OpenClaw (dry run)');
    } else {
      try {
        await execa('npm', ['install', '-g', 'openclaw'], { timeout: 120000 });
        spinner.succeed('OpenClaw installed');
      } catch (err) {
        spinner.fail('Failed to install OpenClaw');
        console.log(chalk.yellow('  Trying with sudo...'));
        try {
          await execa('sudo', ['npm', 'install', '-g', 'openclaw'], { timeout: 120000 });
          console.log(chalk.green('  ✓ OpenClaw installed with sudo'));
        } catch (err2) {
          throw new Error(`Could not install OpenClaw: ${err2.message}`);
        }
      }
    }
  }

  // Install Ollama if user chose local and it's not present
  if (answers.aiProvider === 'ollama' && !system.hasOllama) {
    const spinner = ora('Installing Ollama...').start();
    if (dryRun) {
      spinner.succeed('Would install Ollama (dry run)');
    } else {
      try {
        await execa('bash', ['-c', 'curl -fsSL https://ollama.com/install.sh | sh'], { timeout: 300000 });
        spinner.succeed('Ollama installed');

        const modelSpinner = ora('Pulling default model (qwen2.5:7b)...').start();
        try {
          await execa('ollama', ['pull', 'qwen2.5:7b'], { timeout: 600000 });
          modelSpinner.succeed('Default model ready');
        } catch {
          modelSpinner.warn('Model pull failed — you can run "ollama pull qwen2.5:7b" later');
        }
      } catch (err) {
        spinner.fail('Could not install Ollama automatically');
        console.log(chalk.yellow(`  Install manually: https://ollama.com/download`));
      }
    }
  }

  console.log(chalk.green('  ✓ Installation complete'));
}
