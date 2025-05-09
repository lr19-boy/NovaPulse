const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a member in the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to unmute')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) {
      return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
    }

    if (!member.moderatable) {
      return interaction.reply({ content: 'I cannot unmute this user.', ephemeral: true });
    }

    try {
      await member.timeout(null, 'Unmuted by moderator command');
      await interaction.reply({ content: `Successfully unmuted ${target.tag}.` });
    } catch (error) {
      console.error('Error unmuting member:', error);
      await interaction.reply({ content: 'Failed to unmute the member.', ephemeral: true });
    }
  },
};
