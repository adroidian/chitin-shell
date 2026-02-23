import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { detectSystem } from './detect.js';
import { installOpenClaw } from './install.js';
import { configureAgent } from './configure.js';
import { hardenSecurity } from './harden.js';
import { setupTrustChannels } from './trust.js';
import { verifySetup } from './verify.js';

const BANNER = `
${chalk.cyan.bold('╔══════════════════════════════════════════╗')}
${chalk.cyan.bold('║')}  ${chalk.white.bold('🛡️  Chitin Bootstrap')}                     ${chalk.cyan.bold('║')}
${chalk.cyan.bold('║')}  ${chalk.gray('Your first secure AI agent in 10 minutes')} ${chalk.cyan.bold('║')}
${chalk.cyan.bold('║')}  ${chalk.gray('chitin.xyz')}                              ${chalk.cyan.bold('║')}
${chalk.cyan.bold('╚══════════════════════════════════════════╝')}
`;

export async function bootstrap({ dryRun = false } = {}) {
  console.log(BANNER);

  if (dryRun) {
    console.log(chalk.yellow('  [DRY RUN MODE — no changes will be made]\n'));
  }

  // Phase 1: Detect system
  console.log(chalk.blue.bold('\n📋 Phase 1: System Detection\n'));
  const system = await detectSystem({ dryRun });

  // Phase 2: Ask the user 5 questions
  console.log(chalk.blue.bold('\n💬 Phase 2: Quick Setup\n'));
  console.log(chalk.gray('  I\'ll handle the technical stuff. You just answer a few questions.\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'ownerName',
      message: 'What\'s your name?',
      validate: (v) => v.trim().length > 0 || 'Name is required',
    },
    {
      type: 'input',
      name: 'agentName',
      message: 'Pick a name for your agent:',
      default: 'Atlas',
      validate: (v) => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(v.trim()) || 'Letters, numbers, hyphens, underscores only',
    },
    {
      type: 'list',
      name: 'channel',
      message: 'How will you talk to your agent?',
      choices: [
        { name: '📱 Telegram (recommended)', value: 'telegram' },
        { name: '💬 Discord', value: 'discord' },
        { name: '💬 Signal', value: 'signal' },
        { name: '⏭️  Skip for now (CLI only)', value: 'none' },
      ],
    },
    {
      type: 'input',
      name: 'botToken',
      message: (answers) => {
        const instructions = {
          telegram: `Go to ${chalk.cyan('@BotFather')} on Telegram → /newbot → paste the token:`,
          discord: `Create a bot at ${chalk.cyan('discord.com/developers')} → paste the token:`,
          signal: `Enter your Signal phone number:`,
        };
        return instructions[answers.channel] || 'Token:';
      },
      when: (answers) => answers.channel !== 'none',
      validate: (v) => v.trim().length > 5 || 'Token looks too short',
    },
    {
      type: 'input',
      name: 'ownerId',
      message: (answers) => {
        const prompts = {
          telegram: 'Your Telegram user ID or @username:',
          discord: 'Your Discord user ID:',
          signal: 'Your Signal phone number:',
        };
        return prompts[answers.channel] || 'Your user ID:';
      },
      when: (answers) => answers.channel !== 'none',
      validate: (v) => v.trim().length > 0 || 'Required for trust channel configuration',
    },
    {
      type: 'password',
      name: 'gatewayPassword',
      message: 'Set a gateway password (min 12 chars):',
      mask: '•',
      validate: (v) => v.length >= 12 || 'Must be at least 12 characters',
    },
    {
      type: 'list',
      name: 'aiProvider',
      message: 'Choose your AI provider:',
      choices: [
        { name: '🆓 Free tier (Groq — fast, no cost)', value: 'groq' },
        { name: '🧠 Anthropic (Claude — best quality, needs API key)', value: 'anthropic' },
        { name: '🌐 OpenAI (GPT — popular, needs API key)', value: 'openai' },
        { name: '🏠 Local (Ollama — private, needs GPU)', value: 'ollama' },
      ],
    },
    {
      type: 'input',
      name: 'apiKey',
      message: 'Paste your API key:',
      when: (answers) => ['anthropic', 'openai'].includes(answers.aiProvider),
      validate: (v) => v.trim().length > 10 || 'API key looks too short',
    },
  ]);

  // Phase 3: Install
  console.log(chalk.blue.bold('\n⚙️  Phase 3: Installation\n'));
  await installOpenClaw({ system, answers, dryRun });

  // Phase 4: Configure
  console.log(chalk.blue.bold('\n🔧 Phase 4: Configuration\n'));
  await configureAgent({ system, answers, dryRun });

  // Phase 5: Harden
  console.log(chalk.blue.bold('\n🔒 Phase 5: Security Hardening\n'));
  await hardenSecurity({ system, answers, dryRun });

  // Phase 6: Trust Channels
  console.log(chalk.blue.bold('\n🛡️  Phase 6: Trust Channels\n'));
  await setupTrustChannels({ system, answers, dryRun });

  // Phase 7: Verify
  console.log(chalk.blue.bold('\n✅ Phase 7: Verification\n'));
  await verifySetup({ system, answers, dryRun });

  // Done!
  console.log(`
${chalk.green.bold('══════════════════════════════════════════════')}
${chalk.green.bold('  ✅ Your agent "' + answers.agentName + '" is live!')}
${chalk.green.bold('══════════════════════════════════════════════')}
${answers.channel !== 'none' ? chalk.white(`
  📱 Send ${chalk.cyan(answers.agentName)} a message on ${answers.channel} to say hello.
`) : chalk.white(`
  💻 Run ${chalk.cyan('openclaw chat')} to talk to your agent.
`)}
  ${chalk.gray('🛡️  Trust Channels: ACTIVE')}
  ${chalk.gray(`   • Your DM: ${chalk.green('Sovereign')} (full access)`)}
  ${chalk.gray(`   • Everything else: ${chalk.blue('Observer')} (read-only)`)}

  ${chalk.gray('📖 Want to understand what\'s under the hood?')}
  ${chalk.cyan('   Get The Vesper Blueprint: https://chitin.xyz')}
  `);
}
