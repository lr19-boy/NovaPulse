const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-remove')
    .setDescription('Remove a user from the ticket')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove from the ticket')
        .setRequired(true)),
  cooldown: 10,
  async execute(interaction) {
    const channel = interaction.channel;
    const userToRemove = interaction.options.getUser('user');

    if (!channel.name.startsWith('ticket-')) {
      await interaction.reply({ content: 'This command can only be used inside a ticket channel.', ephemeral: true });
      return;
    }

    try {
      await channel.permissionOverwrites.edit(userToRemove.id, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false,
      });
      await interaction.reply({ content: `${userToRemove.tag} has been removed from the ticket.` });
    } catch (error) {
      console.error('Error removing user from ticket:', error);
      await interaction.reply({ content: 'Failed to remove user from the ticket.', ephemeral: true });
    }
  },
};
