import { Client, GatewayIntentBits } from 'discord.js';
import { env } from './config/env';
import { deployCommands } from './utils/deployCommands';
import * as readyEvent from './events/ready';
import * as interactionCreateEvent from './events/interactionCreate';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.once(readyEvent.name, readyEvent.execute);
client.on(interactionCreateEvent.name, interactionCreateEvent.execute);

async function main(): Promise<void> {
  try {
    await deployCommands(env.DISCORD_TOKEN, env.CLIENT_ID, env.GUILD_ID);
    await client.login(env.DISCORD_TOKEN);
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

main();