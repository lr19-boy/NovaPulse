const { SlashCommandBuilder } = require('discord.js');
const economyUtils = require('../../utils/economyUtils');

const responses = [
  { text: 'Someone felt sorry for you and gave you', min: 10, max: 50 },
  { text: 'You begged and got lucky! You received', min: 20, max: 100 },
  { text: 'No one noticed your begging this time.', min: 0, max: 0 },
  { text: 'You found some coins on the ground and got', min: 5, max: 30 },
  { text: 'A generous stranger gave you', min: 15, max: 60 },
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('beg')
    .setDescription('Beg for some coins'),
  cooldown: 30,
  async execute(interaction) {
    const userId = interaction.user.id;
    const response = responses[Math.floor(Math.random() * responses.length)];
    const amount = getRandomInt(response.min, response.max);

    if (amount > 0) {
      economyUtils.addBalance(userId, amount);
      await interaction.reply(`${response.text} ${amount} coins!`);
    } else {
      await interaction.reply(response.text);
    }
  },
};
