import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '@/types/command';
import { databuddyAPI } from '@/utils/databuddy-api';

const topPagesCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('top-pages')
    .setDescription('Show top performing pages from Databuddy analytics')
    .addStringOption((option) =>
      option
        .setName('website_id')
        .setDescription('Website ID to get top pages for')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('days')
        .setDescription('Number of days to look back (default: 7)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(365)
    )
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('Number of pages to show (default: 10)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(25)
    ),
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const websiteId = interaction.options.getString('website_id', true);
      const days = interaction.options.getInteger('days') ?? 7;
      const limit = interaction.options.getInteger('limit') ?? 10;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const analytics = await databuddyAPI.getAnalytics(websiteId, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        granularity: 'day',
      });

      const { top_pages, summary } = analytics.data;

      if (top_pages.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle('📄 Top Pages')
          .setDescription('No page data found for the specified period')
          .setColor(0xff_cc_02)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('📄 Top Pages')
        .setDescription(
          `Top ${Math.min(limit, top_pages.length)} pages for the last ${days} days`
        )
        .setColor(0x00_d4_aa)
        .setTimestamp();

      // Add total pageviews context
      embed.addFields({
        name: '📊 Total Pageviews',
        value: summary.pageviews.toLocaleString(),
        inline: true,
      });

      embed.addFields({
        name: '👥 Total Visitors',
        value: summary.visitors.toLocaleString(),
        inline: true,
      });

      embed.addFields({
        name: '📈 Pages Tracked',
        value: top_pages.length.toString(),
        inline: true,
      });

      // Create pages list
      const pagesText = top_pages
        .slice(0, limit)
        .map((page, index) => {
          const percentage =
            summary.pageviews > 0
              ? ((page.pageviews / summary.pageviews) * 100).toFixed(1)
              : '0.0';
          return `**${index + 1}.** \`${page.path}\`\n📄 ${page.pageviews.toLocaleString()} views • 👥 ${page.visitors.toLocaleString()} visitors • ${percentage}% of total`;
        })
        .join('\n\n');

      // Split into multiple fields if too long
      if (pagesText.length > 1024) {
        const midpoint = Math.ceil(top_pages.slice(0, limit).length / 2);

        const firstHalf = top_pages
          .slice(0, midpoint)
          .map((page, index) => {
            const percentage =
              summary.pageviews > 0
                ? ((page.pageviews / summary.pageviews) * 100).toFixed(1)
                : '0.0';
            return `**${index + 1}.** \`${page.path}\`\n📄 ${page.pageviews.toLocaleString()} views • 👥 ${page.visitors.toLocaleString()} visitors • ${percentage}% of total`;
          })
          .join('\n\n');

        const secondHalf = top_pages
          .slice(midpoint, limit)
          .map((page, index) => {
            const percentage =
              summary.pageviews > 0
                ? ((page.pageviews / summary.pageviews) * 100).toFixed(1)
                : '0.0';
            return `**${midpoint + index + 1}.** \`${page.path}\`\n📄 ${page.pageviews.toLocaleString()} views • 👥 ${page.visitors.toLocaleString()} visitors • ${percentage}% of total`;
          })
          .join('\n\n');

        embed.addFields(
          {
            name: `🔝 Top Pages (1-${midpoint})`,
            value: firstHalf,
            inline: false,
          },
          {
            name: `🔝 Top Pages (${midpoint + 1}-${limit})`,
            value: secondHalf,
            inline: false,
          }
        );
      } else {
        embed.addFields({
          name: '🔝 Top Pages',
          value: pagesText,
          inline: false,
        });
      }

      embed.setFooter({ text: `Website ID: ${websiteId}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription(
          `Failed to fetch top pages: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        .setColor(0xff_00_00)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

export default topPagesCommand;
