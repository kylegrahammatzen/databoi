import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/command';

const helloCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Says hello to a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to greet')
        .setRequired(false)
    ),
  execute: async (interaction) => {
    const user = interaction.options.getUser('user') || interaction.user;
    const username = user.displayName || user.username;
    await interaction.reply(`Hello, ${username}!`);
  },
};

export default helloCommand;
