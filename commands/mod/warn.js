const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(false)),
  cooldown: 5,
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      logger.warn(`User ${interaction.user.tag} tried to use warn without permission.`);
      return;
    }

    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      // Here you would normally log the warning to a database or file
      await interaction.reply({ content: `Warned ${target.tag} for: ${reason}`, ephemeral: false });
      logger.info(`User ${interaction.user.tag} warned ${target.tag} for: ${reason}`);
    } catch (error) {
      logger.error(`Failed to warn user: ${error.message}`);
      await interaction.reply({ content: 'Failed to warn user.', ephemeral: true });
    }
  },
};
