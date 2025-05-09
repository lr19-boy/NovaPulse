const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete a number of messages from the channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)),
  cooldown: 5,
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      logger.warn(`User ${interaction.user.tag} tried to use purge without permission.`);
      return;
    }

    const amount = interaction.options.getInteger('amount');

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({ content: `Deleted ${deleted.size} messages.`, ephemeral: true });
      logger.info(`User ${interaction.user.tag} deleted ${deleted.size} messages in channel ${interaction.channel.name}.`);
    } catch (error) {
      logger.error(`Error deleting messages: ${error.message}`);
      await interaction.reply({ content: 'Failed to delete messages. Make sure messages are not older than 14 days.', ephemeral: true });
    }
  },
};
