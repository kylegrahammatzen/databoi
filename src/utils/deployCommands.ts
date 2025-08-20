import { REST, Routes } from 'discord.js';
import { commandHandler } from '../handlers/commandHandler';

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
      console.log(
        `Started refreshing ${commands.length} guild (/) commands for guild ${guildId}.`
      );

      const data = (await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      )) as unknown[];

      console.log(`Successfully reloaded ${data.length} guild (/) commands.`);
    } else {
      console.log(
        `Started refreshing ${commands.length} global application (/) commands.`
      );
      console.log(
        'Note: Global commands can take up to 1 hour to propagate. Consider using GUILD_ID for instant updates.'
      );

      const data = (await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      })) as unknown[];

      console.log(
        `Successfully reloaded ${data.length} global application (/) commands.`
      );
    }
  } catch (error) {
    console.error('Error deploying commands:', error);
    throw error;
  }
}
