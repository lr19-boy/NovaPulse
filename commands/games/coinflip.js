const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin"),
  cooldown: 3,
  async execute(interaction) {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Coin Flip")
      .setDescription(`The coin landed on: **${result}**!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
