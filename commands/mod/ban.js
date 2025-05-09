const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to ban')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) {
      return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ content: 'I cannot ban this user.', ephemeral: true });
    }

    try {
      await member.ban();
      await interaction.reply({ content: `Successfully banned ${target.tag}.` });
    } catch (error) {
      console.error('Error banning member:', error);
      await interaction.reply({ content: 'Failed to ban the member.', ephemeral: true });
    }
  },
};
