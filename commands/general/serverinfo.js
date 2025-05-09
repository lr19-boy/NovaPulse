const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get information about the server'),
  cooldown: 5,
  async execute(interaction) {
    const { guild } = interaction;

    const embed = new EmbedBuilder()
      .setTitle(`${guild.name} - Server Info`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Region', value: guild.preferredLocale || 'N/A', inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Created On', value: guild.createdAt.toDateString(), inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true }
      )
      .setColor(0x00AE86)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
