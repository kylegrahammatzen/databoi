import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '@/types/command';
import { databuddyAPI } from '@/utils/databuddy-api';

const websitesCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('websites')
    .setDescription('List all websites in your Databuddy account')
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('Action to perform')
        .setRequired(false)
        .addChoices(
          { name: 'List all websites', value: 'list' },
          { name: 'Get website details', value: 'details' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('website_id')
        .setDescription('Website ID (required for details action)')
        .setRequired(false)
    ),
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const action = interaction.options.getString('action') ?? 'list';
      const websiteId = interaction.options.getString('website_id');

      if (action === 'details') {
        if (!websiteId) {
          const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Error')
            .setDescription('Website ID is required for the details action')
            .setColor(0xff_00_00)
            .setTimestamp();

          await interaction.editReply({ embeds: [errorEmbed] });
          return;
        }

        // Get website details
        const websiteDetails = await databuddyAPI.getWebsiteDetails(websiteId);
        const website = websiteDetails.data;

        const embed = new EmbedBuilder()
          .setTitle('🌐 Website Details')
          .setDescription(`Details for **${website.name}**`)
          .setColor(0x00_d4_aa)
          .setTimestamp()
          .addFields(
            {
              name: '🆔 Website ID',
              value: `\`${website.id}\``,
              inline: true,
            },
            {
              name: '🌍 Domain',
              value: website.domain,
              inline: true,
            },
            {
              name: '✅ Verified',
              value: website.verified ? '✅ Yes' : '❌ No',
              inline: true,
            },
            {
              name: '📅 Created',
              value: new Date(website.created_at).toLocaleDateString(),
              inline: true,
            },
            {
              name: '📊 Monthly Pageviews',
              value: website.monthly_pageviews.toLocaleString(),
              inline: true,
            },
            {
              name: '🔧 Tracking Code',
              value: `\`${website.tracking_code.substring(0, 20)}...\``,
              inline: true,
            }
          );

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // List all websites
      const websites = await databuddyAPI.getWebsites();

      if (websites.data.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle('🌐 Your Websites')
          .setDescription('No websites found in your Databuddy account')
          .setColor(0xff_cc_02)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('🌐 Your Websites')
        .setDescription(
          `Found ${websites.data.length} website${websites.data.length === 1 ? '' : 's'} in your account`
        )
        .setColor(0x00_d4_aa)
        .setTimestamp();

      // Create website list
      const websiteList = websites.data
        .map((website, index) => {
          const status = website.verified ? '✅' : '❌';
          const createdDate = new Date(website.created_at).toLocaleDateString();
          return `**${index + 1}.** ${status} **${website.name}**\n🌍 \`${website.domain}\`\n🆔 \`${website.id}\`\n📅 Created: ${createdDate}`;
        })
        .join('\n\n');

      // Split into multiple fields if too long
      if (websiteList.length > 1024) {
        const midpoint = Math.ceil(websites.data.length / 2);

        const firstHalf = websites.data
          .slice(0, midpoint)
          .map((website, index) => {
            const status = website.verified ? '✅' : '❌';
            const createdDate = new Date(
              website.created_at
            ).toLocaleDateString();
            return `**${index + 1}.** ${status} **${website.name}**\n🌍 \`${website.domain}\`\n🆔 \`${website.id}\`\n📅 Created: ${createdDate}`;
          })
          .join('\n\n');

        const secondHalf = websites.data
          .slice(midpoint)
          .map((website, index) => {
            const status = website.verified ? '✅' : '❌';
            const createdDate = new Date(
              website.created_at
            ).toLocaleDateString();
            return `**${midpoint + index + 1}.** ${status} **${website.name}**\n🌍 \`${website.domain}\`\n🆔 \`${website.id}\`\n📅 Created: ${createdDate}`;
          })
          .join('\n\n');

        embed.addFields(
          {
            name: `📋 Websites (1-${midpoint})`,
            value: firstHalf,
            inline: false,
          },
          {
            name: `📋 Websites (${midpoint + 1}-${websites.data.length})`,
            value: secondHalf,
            inline: false,
          }
        );
      } else {
        embed.addFields({
          name: '📋 Websites',
          value: websiteList,
          inline: false,
        });
      }

      embed.addFields({
        name: '💡 Tip',
        value:
          'Use `/websites action:details website_id:<id>` to get detailed information about a specific website',
        inline: false,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription(
          `Failed to fetch websites: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        .setColor(0xff_00_00)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

export default websitesCommand;
