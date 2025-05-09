const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const DAILY_REWARD = 100; // Example reward amount

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward'),
  cooldown: 86400,
  async execute(interaction) {
    const userId = interaction.user.id;
    const dataPath = path.join(__dirname, '../../data/economy.json');

    let economyData = {};
    try {
      const rawData = fs.readFileSync(dataPath);
      economyData = JSON.parse(rawData);
    } catch (error) {
      logger.error(`Failed to read economy data: ${error.message}`);
      await interaction.reply({ content: 'Error reading economy data.', ephemeral: true });
      return;
    }

    const now = Date.now();
    const userData = economyData[userId] || { balance: 0, lastDaily: 0, xp: 0, level: 1 };

    if (userData.lastDaily && now - userData.lastDaily < DAILY_COOLDOWN) {
      const timeLeft = DAILY_COOLDOWN - (now - userData.lastDaily);
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      await interaction.reply({ content: `You have already claimed your daily reward. Please wait ${hours}h ${minutes}m.`, ephemeral: true });
      return;
    }

    userData.balance = (userData.balance || 0) + DAILY_REWARD;
    userData.lastDaily = now;
    economyData[userId] = userData;

    try {
      fs.writeFileSync(dataPath, JSON.stringify(economyData, null, 2));
      await interaction.reply({ content: `You have claimed your daily reward of ${DAILY_REWARD} coins!`, ephemeral: false });
      logger.info(`User ${interaction.user.tag} claimed daily reward.`);
    } catch (error) {
      logger.error(`Failed to write economy data: ${error.message}`);
      await interaction.reply({ content: 'Failed to update your daily reward.', ephemeral: true });
    }
  },
};
