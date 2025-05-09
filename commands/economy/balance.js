const { SlashCommandBuilder } = require('discord.js');
const economyUtils = require('../../utils/economyUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your current balance'),
  cooldown: 5,
  async execute(interaction) {
    const userId = interaction.user.id;
    const balance = economyUtils.getBalance(userId);

    await interaction.reply({ content: `Your current balance is ${balance} coins.` });
  },
};
