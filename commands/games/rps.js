const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play Rock-Paper-Scissors")
    .addStringOption(option =>
      option.setName("choice")
        .setDescription("Your choice: rock, paper, or scissors")
        .setRequired(true)
        .addChoices(
          { name: "Rock", value: "rock" },
          { name: "Paper", value: "paper" },
          { name: "Scissors", value: "scissors" }
        )
    ),
  cooldown: 5,
  async execute(interaction) {
    const userChoice = interaction.options.getString("choice");
    const choices = ["rock", "paper", "scissors"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result;
    if (userChoice === botChoice) {
      result = "It's a tie!";
    } else if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper")
    ) {
      result = "You win!";
    } else {
      result = "You lose!";
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Rock-Paper-Scissors")
      .setDescription(`You chose **${userChoice}**.\nI chose **${botChoice}**.\n\n**${result}**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
