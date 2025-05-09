const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top users by balance'),
  cooldown: 10,
  async execute(interaction) {
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

    // Sort users by balance descending
    const sortedUsers = Object.entries(economyData)
      .filter(([userId, userData]) => userData && userData.balance !== undefined)
      .sort((a, b) => b[1].balance - a[1].balance)
      .slice(0, 10);

    if (sortedUsers.length === 0) {
      await interaction.reply({ content: 'No leaderboard data available.', ephemeral: true });
      return;
    }

    let leaderboard = '**Leaderboard - Top 10 Users by Balance:**\n';
    for (let i = 0; i < sortedUsers.length; i++) {
      const userId = sortedUsers[i][0];
      const userData = sortedUsers[i][1];
      const userTag = await interaction.client.users.fetch(userId).then(user => user.tag).catch(() => 'Unknown User');
      leaderboard += `${i + 1}. ${userTag} - Balance: ${userData.balance} coins\n`;
    }

    await interaction.reply({ content: leaderboard, ephemeral: false });
    logger.info(`Leaderboard requested by ${interaction.user.tag}`);
  },
};
