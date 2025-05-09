const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to get info about')
        .setRequired(false)),
  cooldown: 5,
  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`${user.tag} - User Info`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'User ID', value:   user.id, inline: true },
        { name: 'Username', value: user.username, inline: true },
        { name: 'Discriminator', value: `#${user.discriminator}`, inline: true },
        { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: 'Account Created', value: user.createdAt.toDateString(), inline: true },
        { name: 'Joined Server', value: member ? member.joinedAt.toDateString() : 'N/A', inline: true },
        { name: 'Roles', value: member ? member.roles.cache.map(role => role.name).filter(name => name !== '@everyone').join(', ') || 'None' : 'N/A' }
      )
      .setColor(0x00AE86)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
