[![Databuddy Banner](.github/banner.png)](https://databuddy.cc/)

# Databoi

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?logo=discord&logoColor=white)](https://discord.js.org)

A TypeScript Discord bot with slash command support, built with modern development practices and full type safety.

## Features

- Full TypeScript support with strict typing
- Slash commands with Discord.js v14
- Environment variable validation
- Automatic command deployment
- Error handling and logging

## Getting Started

**Prerequisites:**
- [Bun](https://bun.sh/) installed
- Discord bot token and application ID

**Setup:**

1. Clone and install dependencies:
   ```bash
   git clone <repository>
   cd databoi
   bun install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Add your Discord bot token and client ID to `.env`. Optionally add GUILD_ID for instant command updates during development.

3. Invite the bot to your server:
   ```
   https://discord.com/oauth2/authorize?client_id=INSERT_CLIENT_ID_HERE&scope=bot&permissions=2147486720
   ```
   Permissions: View Channels, Send Messages, Use Application Commands
   
   Calculate custom permissions at: https://discordapi.com/permissions.html

4. Start the bot:
   ```bash
   bun run dev
   ```

## Available Commands

- `/ping` - Simple ping-pong response
- `/hello` - Greet a user (optional user parameter)

## Development

**Build for production:**
```bash
bun run build
bun start
```

**Watch mode:**
```bash
bun run watch
```

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

Copyright (c) 2025 Databoi