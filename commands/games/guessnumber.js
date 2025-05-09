const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guessnumber")
    .setDescription("Guess a number between 1 and 100")
    .addIntegerOption(option =>
      option.setName("number")
        .setDescription("Your guess")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
  cooldown: 5,
  async execute(interaction) {
    const userGuess = interaction.options.getInteger("number");
    const targetNumber = Math.floor(Math.random() * 100) + 1;

    let responseText;
    if (userGuess === targetNumber) {
      responseText = `🎉 Congratulations! You guessed the correct number: ${targetNumber}`;
    } else if (userGuess < targetNumber) {
      responseText = `Too low! Try a higher number than ${userGuess}.`;
    } else {
      responseText = `Too high! Try a lower number than ${userGuess}.`;
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Guess the Number")
      .setDescription(responseText)
      .setFooter({ text: "Guess a number between 1 and 100" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
