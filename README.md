# 🛡️ Chitin Bootstrap

**Your first secure AI agent in 10 minutes.**

```bash
npx chitin-bootstrap
```

No decisions. No configuration files. No security expertise needed.

Answer 5 questions. Get a production-hardened AI agent with contextual trust boundaries.

## What It Does

1. **Detects** your system (OS, CPU, memory, available tools)
2. **Asks** 5 simple questions (name, agent name, channel, provider, password)
3. **Installs** OpenClaw and your chosen AI provider
4. **Configures** your agent with secure defaults
5. **Hardens** your system (UFW firewall, fail2ban, file permissions)
6. **Deploys** [Chitin Trust Channels](https://github.com/adroidian/chitin-trust-channels) — contextual agent permissions
7. **Verifies** everything works

## The Security Problem

Most agent setups are insecure by default because they require users to make security decisions. Every decision is a place to get it wrong.

**Chitin Bootstrap eliminates the decisions.** Security is structural, not optional.

| Feature | Default | User Choice? |
|---|---|---|
| UFW firewall | Deny all incoming | No |
| fail2ban | Active on SSH | No |
| Gateway binding | Loopback only | No |
| Trust channels | Sovereign (owner DM), Observer (everything else) | No |
| Secrets encryption | Restricted file permissions (700) | No |
| Sub-agent sandbox | Docker isolation | No |

## Supported Providers

| Provider | Cost | Quality | Notes |
|---|---|---|---|
| 🆓 Groq | Free | Good | Llama 3.3 70B, fast inference |
| 🧠 Anthropic | Paid | Best | Claude Sonnet/Opus |
| 🌐 OpenAI | Paid | Great | GPT-4o |
| 🏠 Ollama | Free | Varies | Local, private, needs GPU |

## Supported Channels

- 📱 **Telegram** (recommended)
- 💬 **Discord**
- 💬 **Signal**
- 💻 **CLI** (no channel needed)

## Dry Run

Test without making changes:

```bash
npx chitin-bootstrap --dry-run
```

## What's Next?

After bootstrap, level up with **[The Vesper Blueprint](https://chitin.xyz)** — a comprehensive guide to understanding and customizing your agent's architecture.

## Built By

[Chitin.xyz](https://chitin.xyz) — Trust infrastructure for the agent economy.

## License

Apache 2.0
