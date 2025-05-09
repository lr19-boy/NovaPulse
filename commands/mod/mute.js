const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a member in the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to mute')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration of mute in minutes')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const duration = interaction.options.getInteger('duration') || 10; // default 10 minutes
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) {
      return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
    }

    if (!member.moderatable) {
      return interaction.reply({ content: 'I cannot mute this user.', ephemeral: true });
    }

    try {
      await member.timeout(duration * 60 * 1000, 'Muted by moderator command');
      await interaction.reply({ content: `Successfully muted ${target.tag} for ${duration} minute(s).` });
    } catch (error) {
      console.error('Error muting member:', error);
      await interaction.reply({ content: 'Failed to mute the member.', ephemeral: true });
    }
  },
};
