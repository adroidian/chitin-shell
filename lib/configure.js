import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const OPENCLAW_DIR = path.join(os.homedir(), '.openclaw');
const WORKSPACE_DIR = path.join(OPENCLAW_DIR, 'workspace');
const SECRETS_DIR = path.join(WORKSPACE_DIR, '.secrets');

export async function configureAgent({ system, answers, dryRun = false } = {}) {
  if (dryRun) {
    console.log(chalk.gray('  Would create OpenClaw configuration (dry run)'));
    console.log(chalk.green('  ✓ Configuration complete (dry run)'));
    return;
  }

  // Create directories
  await fs.mkdir(OPENCLAW_DIR, { recursive: true });
  await fs.mkdir(WORKSPACE_DIR, { recursive: true });
  await fs.mkdir(SECRETS_DIR, { recursive: true, mode: 0o700 });
  await fs.mkdir(path.join(WORKSPACE_DIR, 'memory'), { recursive: true });

  // Build provider config
  const providers = buildProviders(answers);
  const models = buildModels(answers);
  const channels = buildChannels(answers);
  const agents = buildAgents(answers);

  const config = {
    gateway: {
      bind: 'loopback',
      auth: {
        mode: 'password',
        password: `\${OPENCLAW_GATEWAY_AUTH}`,
      },
    },
    providers,
    models,
    channels,
    agents,
    sandbox: {
      mode: 'off',
      subagentSandbox: 'docker',
    },
  };

  // Write config
  const configPath = path.join(OPENCLAW_DIR, 'openclaw.json');
  const spinner = ora('Writing configuration...').start();
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  spinner.succeed('Configuration written');

  // Write gateway password as env var
  const envLine = `OPENCLAW_GATEWAY_AUTH=${answers.gatewayPassword}\n`;
  await fs.writeFile(path.join(SECRETS_DIR, 'gateway.env'), envLine, { mode: 0o600 });

  // Write API key if provided
  if (answers.apiKey) {
    const keyEnvMap = {
      anthropic: 'ANTHROPIC_API_KEY',
      openai: 'OPENAI_API_KEY',
    };
    const envName = keyEnvMap[answers.aiProvider];
    if (envName) {
      await fs.writeFile(
        path.join(SECRETS_DIR, `${answers.aiProvider}.env`),
        `${envName}=${answers.apiKey}\n`,
        { mode: 0o600 }
      );
    }
  }

  // Write SOUL.md
  await fs.writeFile(path.join(WORKSPACE_DIR, 'SOUL.md'), `# SOUL.md — Who You Are

You are ${answers.agentName}, an AI assistant built on the Chitin Trust framework.

## Core Truths
- Be genuinely helpful, not performatively helpful
- Be resourceful before asking — try to figure it out first
- Earn trust through competence
- Private things stay private

## Your Human
- Name: ${answers.ownerName}
- Channel: ${answers.channel || 'CLI'}

## Boundaries
- Constrain your capabilities to your current Trust Channel level
- Never expose secrets or private data outside sovereign channels
- When in doubt, ask before acting externally
`);

  // Write AGENTS.md
  await fs.writeFile(path.join(WORKSPACE_DIR, 'AGENTS.md'), `# AGENTS.md

## Every Session
1. Read SOUL.md — this is who you are
2. Check your Trust Channel level for this conversation
3. Constrain capabilities accordingly

## Memory
- Daily notes: memory/YYYY-MM-DD.md
- Long-term: MEMORY.md (sovereign channels only)

## Safety
- Trust channels are enforced — never escalate beyond your channel ceiling
- Don't exfiltrate private data
- trash > rm
`);

  // Write initial MEMORY.md
  const today = new Date().toISOString().split('T')[0];
  await fs.writeFile(path.join(WORKSPACE_DIR, 'MEMORY.md'), `# MEMORY.md — ${answers.agentName}'s Long-Term Memory

## Who I Am
- **Name:** ${answers.agentName}
- **Born:** ${today}
- **Human:** ${answers.ownerName}
- **Created by:** Chitin Shell (chitin.xyz)

## Setup
- **Provider:** ${answers.aiProvider}
- **Channel:** ${answers.channel || 'CLI only'}
- **Trust Channels:** Active (Sovereign for owner DM, Observer for all else)
`);

  console.log(chalk.green('  ✓ Configuration complete'));
}

function buildProviders(answers) {
  const map = {
    groq: {
      groq: { type: 'openai-completions', url: 'https://api.groq.com/openai/v1', env: 'GROQ_API_KEY' },
    },
    anthropic: {
      anthropic: { type: 'anthropic' },
    },
    openai: {
      openai: { type: 'openai-completions' },
    },
    ollama: {
      ollama: { type: 'ollama', url: 'http://localhost:11434' },
    },
  };
  return map[answers.aiProvider] || map.groq;
}

function buildModels(answers) {
  const map = {
    groq: [{ id: 'groq/llama-3.3-70b-versatile', provider: 'groq' }],
    anthropic: [{ id: 'anthropic/claude-sonnet-4-5', provider: 'anthropic' }],
    openai: [{ id: 'openai/gpt-4o', provider: 'openai' }],
    ollama: [{ id: 'ollama/qwen2.5:7b', provider: 'ollama' }],
  };
  return { list: map[answers.aiProvider] || map.groq };
}

function buildChannels(answers) {
  if (answers.channel === 'none' || !answers.channel) return {};

  const channelConfig = {
    telegram: {
      telegram: {
        token: answers.botToken,
        allowedUsers: [answers.ownerId],
      },
    },
    discord: {
      discord: {
        token: answers.botToken,
      },
    },
    signal: {
      signal: {
        number: answers.botToken,
      },
    },
  };

  return channelConfig[answers.channel] || {};
}

function buildAgents(answers) {
  return {
    list: [
      {
        id: answers.agentName.toLowerCase(),
        name: answers.agentName,
      },
    ],
  };
}
