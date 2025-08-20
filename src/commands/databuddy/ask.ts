import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '@/types/command';
import { databuddyAPI } from '@/utils/databuddy-api';

const askCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the Databuddy AI assistant about your analytics')
    .addStringOption((option) =>
      option
        .setName('website_id')
        .setDescription('Website ID to query analytics for')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('question')
        .setDescription('Your analytics question')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('days')
        .setDescription('Number of days to look back (default: 7)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(365)
    ),
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const websiteId = interaction.options.getString('website_id', true);
      const question = interaction.options.getString('question', true);
      const days = interaction.options.getInteger('days') ?? 7;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const context = {
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
      };

      const response = await databuddyAPI.askAssistant(
        websiteId,
        question,
        context
      );

      const embed = new EmbedBuilder()
        .setTitle('🤖 AI Assistant')
        .setDescription(`**Question:** ${question}`)
        .setColor(0x00_d4_aa)
        .setTimestamp();

      // Add the AI response
      embed.addFields({
        name: '💬 Answer',
        value: response.content || 'No response received',
        inline: false,
      });

      // Add data context if available
      if (response.data) {
        let dataText = '';
        try {
          if (typeof response.data === 'object' && response.data !== null) {
            const data = response.data as Record<string, unknown>;

            if (data.chart_type) {
              dataText += `📊 **Chart Type:** ${data.chart_type}\n`;
            }

            if (data.results && Array.isArray(data.results)) {
              dataText += '📈 **Results:**\n';
              data.results
                .slice(0, 5)
                .forEach((result: unknown, index: number) => {
                  if (typeof result === 'object' && result !== null) {
                    const item = result as Record<string, unknown>;
                    const keys = Object.keys(item);
                    if (keys.length >= 2) {
                      dataText += `${index + 1}. **${item[keys[0]]}**: ${item[keys[1]]}\n`;
                    }
                  }
                });
            }
          }
        } catch {
          dataText = 'Data format not recognized';
        }

        if (dataText.trim()) {
          embed.addFields({
            name: '📊 Data',
            value: dataText.trim(),
            inline: false,
          });
        }
      }

      // Add query context
      embed.addFields(
        {
          name: '📅 Date Range',
          value: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
          inline: true,
        },
        {
          name: '📊 Period',
          value: `${days} days`,
          inline: true,
        },
        {
          name: '🆔 Website',
          value: `\`${websiteId}\``,
          inline: true,
        }
      );

      embed.addFields({
        name: '💡 Tips',
        value:
          'Try questions like:\n• "Show me top pages last week"\n• "What was my conversion rate yesterday?"\n• "Compare this month vs last month traffic"',
        inline: false,
      });

      embed.setFooter({ text: 'Powered by Databuddy AI Assistant' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription(
          `Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        .setColor(0xff_00_00)
        .setTimestamp();

      // Add some helpful context for common errors
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorEmbed.addFields({
            name: '🔑 API Key Issue',
            value:
              'Make sure your Databuddy API key is properly configured in the environment variables.',
            inline: false,
          });
        } else if (error.message.includes('not found')) {
          errorEmbed.addFields({
            name: '🔍 Website Not Found',
            value:
              'The specified website ID was not found. Use `/websites` to see your available websites.',
            inline: false,
          });
        }
      }

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

export default askCommand;
