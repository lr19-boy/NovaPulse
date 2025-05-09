const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Roll a six-sided dice"),
  cooldown: 3,
  async execute(interaction) {
    const roll = Math.floor(Math.random() * 6) + 1;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Dice Roll")
      .setDescription(`You rolled a **${roll}**!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
