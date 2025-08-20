[![Databuddy Banner](.github/banner.png)](https://databuddy.cc/)

# Databoi

<div align="center">

[![License: AGPL](https://img.shields.io/badge/License-AGPL-red.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.2-blue.svg)](https://bun.sh/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.21-5865F2.svg)](https://discord.js.org)
[![Pino](https://img.shields.io/badge/Pino-9.9-green.svg)](https://getpino.io/)

</div>

A TypeScript Discord bot with slash command support, built with modern development practices and full type safety.

## Features

- Full TypeScript support with strict typing
- Slash commands with Discord.js v14
- Professional logging with Pino logger
- Environment variable validation
- Modular architecture with organized command structure

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
   # Development mode
   bun run dev
   
   # Watch mode
   bun run watch
   ```

## Available Commands

- `/ping` - Simple ping-pong response with latency
- `/hello [user]` - Greet a user (optional user parameter)

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

Copyright (c) 2025 Databoi