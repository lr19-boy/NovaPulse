const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Set up a reaction role message')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to react to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true)),
  cooldown: 10,
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      logger.warn(`User ${interaction.user.tag} tried to use reactionrole without permission.`);
      return;
    }

    const messageContent = interaction.options.getString('message');
    const roleName = interaction.options.getString('role');
    const role = interaction.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
      await interaction.reply({ content: `Role "${roleName}" not found.`, ephemeral: true });
      return;
    }

    try {
      const sentMessage = await interaction.channel.send(messageContent);
      await sentMessage.react('👍'); // Example reaction emoji

      // Here you would normally save the message ID and role mapping for reaction role handling in an event listener

      await interaction.reply({ content: 'Reaction role message set up successfully.', ephemeral: true });
      logger.info(`Reaction role message set by ${interaction.user.tag} for role ${roleName}.`);
    } catch (error) {
      logger.error(`Failed to set up reaction role message: ${error.message}`);
      await interaction.reply({ content: 'Failed to set up reaction role message.', ephemeral: true });
    }
  },
};
