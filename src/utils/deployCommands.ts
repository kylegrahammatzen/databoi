import { REST, Routes } from 'discord.js';
import { commandHandler } from '../handlers/commandHandler';
import logger from './logger';

export async function deployCommands(
  token: string,
  clientId: string,
  guildId?: string
): Promise<void> {
  if (!(token && clientId)) {
    throw new Error('Missing DISCORD_TOKEN or CLIENT_ID');
  }

  const commands = commandHandler.getCommandData();

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    if (guildId) {
      logger.info(
        { commandCount: commands.length, guildId, mode: 'development' },
        'Starting guild command deployment'
      );

      const data = (await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      )) as unknown[];

      logger.info(
        { deployedCount: data.length, guildId },
        'Guild commands deployed successfully'
      );
    } else {
      logger.info(
        { commandCount: commands.length, mode: 'production' },
        'Starting global command deployment'
      );

      const data = (await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      })) as unknown[];

      logger.info(
        { deployedCount: data.length },
        'Global commands deployed successfully'
      );
    }
  } catch (error) {
    logger.error(
      { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      'Command deployment failed'
    );
    throw error;
  }
}
