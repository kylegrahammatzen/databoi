import type { Client } from 'discord.js';
import { Events } from 'discord.js';
import logger from '../utils/logger';

export const name = Events.ClientReady;
export const once = true;

export function execute(client: Client<true>): void {
  logger.info(
    { 
      username: client.user.tag, 
      guildCount: client.guilds.cache.size 
    }, 
    'Bot is ready and logged in'
  );
}
