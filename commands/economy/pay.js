const { SlashCommandBuilder } = require('discord.js');
const economyUtils = require('../../utils/economyUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Pay coins to another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to pay')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The amount to pay')
        .setRequired(true)),
  cooldown: 10,
  async execute(interaction) {
    const payerId = interaction.user.id;
    const payee = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (payee.bot) {
      await interaction.reply({ content: 'You cannot pay bots.', ephemeral: true });
      return;
    }

    if (payee.id === payerId) {
      await interaction.reply({ content: 'You cannot pay yourself.', ephemeral: true });
      return;
    }

    if (amount <= 0) {
      await interaction.reply({ content: 'Please enter a positive amount to pay.', ephemeral: true });
      return;
    }

    const payerBalance = economyUtils.getBalance(payerId);
    if (payerBalance < amount) {
      await interaction.reply({ content: 'You do not have enough coins to pay that amount.', ephemeral: true });
      return;
    }

    economyUtils.subtractBalance(payerId, amount);
    economyUtils.addBalance(payee.id, amount);

    await interaction.reply({ content: `You have paid ${amount} coins to ${payee.username}.` });
  },
};
