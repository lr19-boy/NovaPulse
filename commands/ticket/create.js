const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-create')
    .setDescription('Create a new support ticket'),
  cooldown: 10,
  async execute(interaction) {
    const guild = interaction.guild;
    const user = interaction.user;

    // Check if user already has an open ticket
    const existingChannel = guild.channels.cache.find(
      channel =>
        channel.name === `ticket-${user.username.toLowerCase()}` &&
        channel.topic === `Ticket for ${user.id}`
    );

    if (existingChannel) {
      await interaction.reply({ content: 'You already have an open ticket.', ephemeral: true });
      return;
    }

    // Create the ticket channel
    const channel = await guild.channels.create({
      name: `ticket-${user.username.toLowerCase()}`,
      type: 0, // GUILD_TEXT in discord.js v14 is 0
      topic: `Ticket for ${user.id}`,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
        },
      ],
    });

    await interaction.reply({ content: `Your ticket has been created: ${channel}`, ephemeral: true });
  },
};
