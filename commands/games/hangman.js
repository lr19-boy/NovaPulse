const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const words = [
  'javascript', 'discord', 'bot', 'nodejs', 'programming', 'hangman', 'challenge', 'developer', 'computer', 'algorithm'
];

function createWordDisplay(word, guessedLetters) {
  return word.split('').map(letter => (guessedLetters.has(letter) ? letter : '⬜')).join(' ');
}

function createLetterButtons(guessedLetters) {
  const rows = [];
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  for (let i = 0; i < letters.length; i += 5) {
    const row = new ActionRowBuilder();
    for (let j = i; j < i + 5 && j < letters.length; j++) {
      const letter = letters[j];
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`hangman_${letter}`)
          .setLabel(letter.toUpperCase())
          .setStyle(ButtonStyle.Primary)
          .setDisabled(guessedLetters.has(letter))
      );
    }
    rows.push(row);
  }
  return rows;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('Play a game of Hangman'),
  cooldown: 10,
  async execute(interaction) {
    const word = words[Math.floor(Math.random() * words.length)];
    const guessedLetters = new Set();
    let wrongGuesses = 0;
    const maxWrongGuesses = 10; // Increased max wrong guesses from 6 to 10

    const embed = new EmbedBuilder()
      .setTitle('Hangman')
      .setDescription(`Word: ${createWordDisplay(word, guessedLetters)}\nWrong guesses: ${wrongGuesses}/${maxWrongGuesses}`)
      .setColor(0x0099FF);

    const message = await interaction.reply({
      embeds: [embed],
      components: createLetterButtons(guessedLetters),
      // fetchReply is deprecated, so remove it and fetch message after reply
    });
    const fetchedMessage = await interaction.fetchReply();

    const filter = i => i.customId.startsWith('hangman_') && i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 600000 });

    collector.on('collect', async i => {
      const letter = i.customId.split('_')[1];
      if (guessedLetters.has(letter)) {
        await i.reply({ content: 'You already guessed that letter!', flags: 64 }); // ephemeral flag
        return;
      }

      guessedLetters.add(letter);

      if (!word.includes(letter)) {
        wrongGuesses++;
      }

      const wordDisplay = createWordDisplay(word, guessedLetters);
      const won = !wordDisplay.includes('⬜');
      const lost = wrongGuesses >= maxWrongGuesses;

      let description = `Word: ${wordDisplay}\nWrong guesses: ${wrongGuesses}/${maxWrongGuesses}`;

      if (won) {
        description += '\n🎉 You won! Congratulations!';
      } else if (lost) {
        description += `\n💀 You lost! The word was: **${word}**`;
      }

      const updatedEmbed = new EmbedBuilder()
        .setTitle('Hangman')
        .setDescription(description)
        .setColor(won ? 0x00FF00 : lost ? 0xFF0000 : 0x0099FF);

      if (won || lost) {
        await i.update({ embeds: [updatedEmbed], components: [] });
        collector.stop();
      } else {
        await i.update({ embeds: [updatedEmbed], components: createLetterButtons(guessedLetters) });
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('Hangman')
          .setDescription('Game ended due to inactivity.')
          .setColor(0xFF0000);

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  },
};
