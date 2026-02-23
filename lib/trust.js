import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

const WORKSPACE_DIR = path.join(os.homedir(), '.openclaw', 'workspace');

export async function setupTrustChannels({ system, answers, dryRun = false } = {}) {
  const config = buildTrustConfig(answers);
  const yamlStr = yaml.dump(config, { lineWidth: 120, quotingType: '"' });

  if (dryRun) {
    console.log(chalk.gray('  Would create chitin-trust-channels.yaml:'));
    console.log(chalk.gray(yamlStr.split('\n').map(l => '    ' + l).join('\n')));
    console.log(chalk.green('  ✓ Trust channels configured (dry run)'));
    return;
  }

  const spinner = ora('Configuring trust channels...').start();

  const configPath = path.join(WORKSPACE_DIR, 'chitin-trust-channels.yaml');
  await fs.writeFile(configPath, yamlStr);

  spinner.succeed('Trust channels configured');

  // Display summary
  console.log(chalk.gray(`    • Owner DM: ${chalk.green('Sovereign')} (full autonomy)`));
  if (answers.channel !== 'none') {
    console.log(chalk.gray(`    • ${answers.channel} groups: ${chalk.blue('Observer')} (read-only)`));
  }
  console.log(chalk.gray(`    • Unknown channels: ${chalk.blue('Observer')} (safe default)`));
  console.log(chalk.gray(`    • Unknown DMs: ${chalk.yellow('Guarded')} (respond on mention)`));

  console.log(chalk.green('  ✓ Trust channels active'));
}

function buildTrustConfig(answers) {
  const config = {
    version: '0.1',
    owner: {},
    channels: [],
    defaults: {
      unknown_channel: 'observer',
      unknown_dm: 'guarded',
    },
  };

  // Set owner identity
  if (answers.channel === 'telegram' && answers.ownerId) {
    config.owner.telegram = answers.ownerId;
    // Owner DM = sovereign
    config.channels.push({
      id: `telegram:${answers.ownerId}`,
      level: 'sovereign',
    });
    // All telegram groups = observer
    config.channels.push({
      id: 'telegram:group:*',
      level: 'observer',
    });
  } else if (answers.channel === 'discord' && answers.ownerId) {
    config.owner.discord = answers.ownerId;
    config.channels.push({
      id: `discord:dm:${answers.ownerId}`,
      level: 'sovereign',
    });
    config.channels.push({
      id: 'discord:*',
      level: 'guarded',
    });
  } else if (answers.channel === 'signal' && answers.ownerId) {
    config.owner.signal = answers.ownerId;
    config.channels.push({
      id: `signal:${answers.ownerId}`,
      level: 'sovereign',
    });
  }

  return config;
}
