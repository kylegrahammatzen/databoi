import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '@/types/command';
import { databuddyAPI } from '@/utils/databuddy-api';

const eventsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('events')
    .setDescription('View custom events and conversions from Databuddy')
    .addStringOption((option) =>
      option
        .setName('website_id')
        .setDescription('Website ID to get events for')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('event_name')
        .setDescription('Filter by specific event name')
        .setRequired(false)
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
      const eventName = interaction.options.getString('event_name');
      const days = interaction.options.getInteger('days') ?? 7;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const events = await databuddyAPI.getEvents(websiteId, {
        eventName: eventName ?? undefined,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      if (events.data.events.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle('📊 Custom Events')
          .setDescription(
            eventName
              ? `No "${eventName}" events found for the last ${days} days`
              : `No custom events found for the last ${days} days`
          )
          .setColor(0xff_cc_02)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('📊 Custom Events')
        .setDescription(
          eventName
            ? `Events for "${eventName}" over the last ${days} days`
            : `All custom events for the last ${days} days`
        )
        .setColor(0x00_d4_aa)
        .setTimestamp();

      // Calculate totals
      const totalEvents = events.data.events.reduce(
        (sum, event) => sum + event.count,
        0
      );
      const totalUniqueUsers = events.data.events.reduce(
        (sum, event) => sum + event.unique_users,
        0
      );

      embed.addFields(
        {
          name: '📈 Total Events',
          value: totalEvents.toLocaleString(),
          inline: true,
        },
        {
          name: '👥 Unique Users',
          value: totalUniqueUsers.toLocaleString(),
          inline: true,
        },
        {
          name: '🎯 Event Types',
          value: events.data.events.length.toString(),
          inline: true,
        }
      );

      // Add event breakdown
      const eventsText = events.data.events
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((event, index) => {
          const avgPerUser =
            event.unique_users > 0
              ? (event.count / event.unique_users).toFixed(1)
              : '0';
          return `**${index + 1}.** \`${event.event_name}\`\n📊 ${event.count.toLocaleString()} events • 👥 ${event.unique_users.toLocaleString()} users • 📈 ${avgPerUser} avg/user`;
        })
        .join('\n\n');

      if (eventsText.length > 1024) {
        const midpoint = Math.ceil(Math.min(10, events.data.events.length) / 2);

        const firstHalf = events.data.events
          .sort((a, b) => b.count - a.count)
          .slice(0, midpoint)
          .map((event, index) => {
            const avgPerUser =
              event.unique_users > 0
                ? (event.count / event.unique_users).toFixed(1)
                : '0';
            return `**${index + 1}.** \`${event.event_name}\`\n📊 ${event.count.toLocaleString()} events • 👥 ${event.unique_users.toLocaleString()} users • 📈 ${avgPerUser} avg/user`;
          })
          .join('\n\n');

        const secondHalf = events.data.events
          .sort((a, b) => b.count - a.count)
          .slice(midpoint, 10)
          .map((event, index) => {
            const avgPerUser =
              event.unique_users > 0
                ? (event.count / event.unique_users).toFixed(1)
                : '0';
            return `**${midpoint + index + 1}.** \`${event.event_name}\`\n📊 ${event.count.toLocaleString()} events • 👥 ${event.unique_users.toLocaleString()} users • 📈 ${avgPerUser} avg/user`;
          })
          .join('\n\n');

        embed.addFields(
          {
            name: `🎯 Events (1-${midpoint})`,
            value: firstHalf,
            inline: false,
          },
          {
            name: `🎯 Events (${midpoint + 1}-10)`,
            value: secondHalf,
            inline: false,
          }
        );
      } else {
        embed.addFields({
          name: '🎯 Event Breakdown',
          value: eventsText,
          inline: false,
        });
      }

      // Add trend information if available
      if (events.data.events_over_time.length > 0) {
        const recentDay =
          events.data.events_over_time[events.data.events_over_time.length - 1];
        const earliestDay = events.data.events_over_time[0];

        // Calculate trend for most common event
        const topEvent = events.data.events.sort(
          (a, b) => b.count - a.count
        )[0];
        const recentCount = Number(recentDay[topEvent.event_name]) || 0;
        const earliestCount = Number(earliestDay[topEvent.event_name]) || 0;

        let trendText = '📊 No trend data available';
        if (recentCount > 0 || earliestCount > 0) {
          const trend =
            recentCount > earliestCount
              ? '📈 Increasing'
              : recentCount < earliestCount
                ? '📉 Decreasing'
                : '➡️ Stable';
          trendText = `${trend} (${topEvent.event_name}: ${earliestCount} → ${recentCount})`;
        }

        embed.addFields({
          name: '📊 Recent Trend',
          value: trendText,
          inline: false,
        });
      }

      embed.setFooter({ text: `Website ID: ${websiteId}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription(
          `Failed to fetch events: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        .setColor(0xff_00_00)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

export default eventsCommand;
