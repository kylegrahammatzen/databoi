import type { ChatInputCommandInteraction, Interaction } from 'discord.js';
import { Events } from 'discord.js';
import { commandHandler } from '../handlers/commandHandler';
import logger from '../utils/logger';

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const command = commandHandler.getCommand(interaction.commandName);

  if (!command) {
    logger.error({ commandName: interaction.commandName }, 'Command not found');
    return;
  }

  try {
    await command.execute(interaction as ChatInputCommandInteraction);
  } catch (error) {
    logger.error({ 
      commandName: interaction.commandName, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'Command execution failed');

    const errorMessage = 'There was an error while executing this command!';

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}
