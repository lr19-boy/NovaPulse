const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to kick')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) {
      return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
    }

    if (!member.kickable) {
      return interaction.reply({ content: 'I cannot kick this user.', ephemeral: true });
    }

    try {
      await member.kick();
      await interaction.reply({ content: `Successfully kicked ${target.tag}.` });
    } catch (error) {
      console.error('Error kicking member:', error);
      await interaction.reply({ content: 'Failed to kick the member.', ephemeral: true });
    }
  },
};
