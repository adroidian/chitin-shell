# Chitin Bootstrap — Zero-Decision Agent Deployment

> "What would it take for someone like my mom to run this?"

## The Insight

Every decision a user has to make is:
1. A place they can get it wrong
2. A place they can introduce a security hole
3. A place they might give up

The answer isn't "make the docs better." It's **eliminate the decisions entirely.**

## The Vision

A single command:

```bash
curl -sL chitin.xyz/install | bash
```

That launches an interactive bootstrapper which:
1. Detects the hardware and OS
2. Installs OpenClaw + dependencies
3. Asks ONLY authentication questions (name, Telegram handle, email)
4. Auto-configures everything else with secure defaults
5. Deploys a Chitin-Trust-Channels config with sane trust levels
6. Connects the user to their agent via their first message

**Total user decisions: ~5 questions. Total time: ~10 minutes.**

## What Gets Automated (vs. Current 7-Chapter Manual Process)

| Current (Manual) | Bootstrap (Automated) |
|---|---|
| Choose hardware | Auto-detect + validate minimum specs |
| Install Ubuntu | Out of scope (assume Linux exists) |
| Install OpenClaw | `npm install -g openclaw` |
| Configure providers | Default to free tier (Groq/HuggingFace) + upgrade prompt |
| Set up Tailscale | `tailscale up` with guided auth |
| Configure AdGuard | Skip (optional, advanced) |
| Wire Telegram bot | Ask for bot token (link to BotFather with instructions) |
| Set up SSH hardening | Auto-configure UFW + fail2ban with defaults |
| Configure trust channels | Auto-generate from answers to auth questions |
| Set up memory system | Auto-initialize workspace + daily notes |
| Set up backups | Auto-configure if NAS detected on network |

## The Question Flow

```
Welcome to Chitin Bootstrap 🛡️

Let's get your AI agent running. I'll handle the technical stuff.
You just answer a few questions.

1. What's your name?
   > Aaron

2. What's your Telegram username? (We'll connect your agent here)
   > @Drwhodor
   
   Great. Go to @BotFather on Telegram, type /newbot, and paste
   the token here:
   > 123456:ABC-DEF...

3. Pick a name for your agent:
   > Vesper
   
4. How should your agent address you?
   > Aaron

5. Set a gateway password (min 12 chars):
   > ************

That's it. Setting up your agent...

[████████████████████░░] Installing OpenClaw...
[████████████████████░░] Configuring security...
[████████████████████░░] Connecting Telegram...
[████████████████████░░] Initializing memory...
[████████████████████████] Done!

✅ Your agent "Vesper" is live.
   Send it a message on Telegram to say hello.

🛡️ Trust Channels: ACTIVE
   • Your DM: Sovereign (full access)
   • Everything else: Observer (read-only)
   
📖 Want to learn what's under the hood?
   Get The Vesper Blueprint: chitin.xyz
```

## Security by Default (Not by Choice)

Key principle: **The user never has to choose security. It's built in.**

| Security Feature | Default | User Choice? |
|---|---|---|
| UFW firewall | Enabled, deny all incoming | No |
| SSH hardening | Key-only, fail2ban active | No |
| Gateway bind | Loopback only | No |
| Trust channels | Sovereign for owner DM, observer for all else | No |
| Secrets storage | `.secrets/` with restricted permissions | No |
| Sandbox mode | Enabled for sub-agents | No |
| Memory privacy | MEMORY.md only loads in sovereign channels | No |
| Backup prompts | Offered if NAS detected, not required | Optional |

## Implementation Options

### Option A: OpenClaw Skill (Fastest)
- Ship as `chitin-bootstrap` skill on ClawHub
- The skill IS the installer — when triggered, it walks through setup
- Works within existing OpenClaw ecosystem
- Limitation: requires OpenClaw to already be installed (chicken-egg)

### Option B: Standalone CLI (Most Accessible)
- `npx chitin-bootstrap` or `curl | bash`
- Installs OpenClaw as part of the process
- No pre-requisites beyond Node.js
- Can be distributed independently

### Option C: OpenClaw Fork / PR (Most Impactful)
- Contribute the guided setup flow directly to OpenClaw
- `openclaw init` becomes the Chitin Bootstrap experience
- Reaches the widest audience
- Requires coordination with OpenClaw maintainers

### Recommended: B first, then C
Build the standalone CLI, prove it works, then propose it upstream as the default `openclaw init` experience.

## Revenue Integration

The bootstrap is FREE. It creates the funnel:

1. **Free**: `chitin-bootstrap` installs and configures everything
2. **$29 (Standard)**: "The Vesper Blueprint" explains WHY each choice was made
3. **$9/mo (Pro)**: Ongoing support, advanced configs, architecture reviews

The free tool builds trust. The guide sells understanding. Pro sells access.

## Tagline

> "Your first agent in 10 minutes. Your first secure agent in 10 minutes."

---

*Chitin Bootstrap is a Chitin.xyz project.*
