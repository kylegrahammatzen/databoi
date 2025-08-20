import { Client, GatewayIntentBits } from 'discord.js';
import { env } from './config/env';
import * as interactionCreateEvent from './events/interactionCreate';
import * as readyEvent from './events/ready';
import { deployCommands } from './utils/deployCommands';
import logger from './utils/logger';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once(readyEvent.name, readyEvent.execute);
client.on(interactionCreateEvent.name, interactionCreateEvent.execute);

async function main(): Promise<void> {
  try {
    await deployCommands(env.DISCORD_TOKEN, env.CLIENT_ID, env.GUILD_ID);
    await client.login(env.DISCORD_TOKEN);
  } catch (error) {
    logger.fatal(
      { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      'Failed to start bot'
    );
    process.exit(1);
  }
}

main();
