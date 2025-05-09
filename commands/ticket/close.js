const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-close')
    .setDescription('Close the current ticket'),
  cooldown: 10,
  async execute(interaction) {
    const channel = interaction.channel;
    const user = interaction.user;

    if (!channel.name.startsWith('ticket-')) {
      await interaction.reply({ content: 'This command can only be used inside a ticket channel.', ephemeral: true });
      return;
    }

    // Optionally, check if the user is the ticket owner or has permissions
    // For simplicity, allow anyone in the ticket channel to close it

    await interaction.reply({ content: 'Closing ticket in 5 seconds...' });

    setTimeout(async () => {
      try {
        await channel.delete('Ticket closed');
      } catch (error) {
        console.error('Error deleting ticket channel:', error);
      }
    }, 5000);
  },
};
