const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-add')
    .setDescription('Add a user to the ticket')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to add to the ticket')
        .setRequired(true)),
  cooldown: 10,
  async execute(interaction) {
    const channel = interaction.channel;
    const userToAdd = interaction.options.getUser('user');

    if (!channel.name.startsWith('ticket-')) {
      await interaction.reply({ content: 'This command can only be used inside a ticket channel.', ephemeral: true });
      return;
    }

    try {
      await channel.permissionOverwrites.edit(userToAdd.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
      await interaction.reply({ content: `${userToAdd.tag} has been added to the ticket.` });
    } catch (error) {
      console.error('Error adding user to ticket:', error);
      await interaction.reply({ content: 'Failed to add user to the ticket.', ephemeral: true });
    }
  },
};
