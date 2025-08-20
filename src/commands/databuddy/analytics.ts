import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '@/types/command';
import { databuddyAPI } from '@/utils/databuddy-api';

const analyticsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('analytics')
    .setDescription('Get website analytics from Databuddy')
    .addStringOption((option) =>
      option
        .setName('website_id')
        .setDescription('Website ID to get analytics for')
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
    .addStringOption((option) =>
      option
        .setName('granularity')
        .setDescription('Data granularity')
        .setRequired(false)
        .addChoices(
          { name: 'Hour', value: 'hour' },
          { name: 'Day', value: 'day' },
          { name: 'Week', value: 'week' },
          { name: 'Month', value: 'month' }
        )
    ),
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const websiteId = interaction.options.getString('website_id', true);
      const days = interaction.options.getInteger('days') ?? 7;
      const granularity =
        (interaction.options.getString('granularity') as
          | 'hour'
          | 'day'
          | 'week'
          | 'month') ?? 'day';

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const analytics = await databuddyAPI.getAnalytics(websiteId, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        granularity,
      });

      const { summary, top_pages, top_referrers, countries } = analytics.data;

      const embed = new EmbedBuilder()
        .setTitle('📊 Website Analytics')
        .setDescription(`Analytics for the last ${days} days`)
        .setColor(0x00_d4_aa)
        .setTimestamp()
        .addFields(
          {
            name: '👥 Visitors',
            value: summary.visitors.toLocaleString(),
            inline: true,
          },
          {
            name: '📄 Pageviews',
            value: summary.pageviews.toLocaleString(),
            inline: true,
          },
          {
            name: '🎯 Sessions',
            value: summary.sessions.toLocaleString(),
            inline: true,
          },
          {
            name: '⏱️ Avg Session Duration',
            value: `${Math.round(summary.avg_session_duration)}s`,
            inline: true,
          },
          {
            name: '📉 Bounce Rate',
            value: `${(summary.bounce_rate * 100).toFixed(1)}%`,
            inline: true,
          },
          {
            name: '📊 Granularity',
            value: granularity.charAt(0).toUpperCase() + granularity.slice(1),
            inline: true,
          }
        );

      // Add top pages
      if (top_pages.length > 0) {
        const topPagesText = top_pages
          .slice(0, 5)
          .map(
            (page, index) =>
              `${index + 1}. \`${page.path}\` - ${page.pageviews.toLocaleString()} views`
          )
          .join('\n');
        embed.addFields({
          name: '🔝 Top Pages',
          value: topPagesText,
          inline: false,
        });
      }

      // Add top referrers
      if (top_referrers.length > 0) {
        const topReferrersText = top_referrers
          .slice(0, 5)
          .map(
            (ref, index) =>
              `${index + 1}. \`${ref.referrer}\` - ${ref.visitors.toLocaleString()} visitors (${ref.percentage.toFixed(1)}%)`
          )
          .join('\n');
        embed.addFields({
          name: '🔗 Top Referrers',
          value: topReferrersText,
          inline: false,
        });
      }

      // Add top countries
      if (countries.length > 0) {
        const topCountriesText = countries
          .slice(0, 5)
          .map(
            (country, index) =>
              `${index + 1}. ${country.country} - ${country.visitors.toLocaleString()} visitors (${country.percentage.toFixed(1)}%)`
          )
          .join('\n');
        embed.addFields({
          name: '🌍 Top Countries',
          value: topCountriesText,
          inline: false,
        });
      }

      embed.setFooter({ text: `Website ID: ${websiteId}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription(
          `Failed to fetch analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        .setColor(0xff_00_00)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

export default analyticsCommand;
