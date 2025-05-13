const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

const words = [
  'javascript', 'discord', 'bot', 'nodejs', 'programming',
  'hangman', 'challenge', 'developer', 'computer', 'algorithm'
];

function createWordDisplay(word, guessedLetters) {
  return word.split('').map(letter => (guessedLetters.has(letter) ? letter : '⬜')).join(' ');
}

function createLetterMenus(guessedLetters) {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  const chunk1 = letters.slice(0, 13);
  const chunk2 = letters.slice(13);

  const createMenu = (chunk, id) => {
    const options = chunk.map(letter => ({
      label: letter.toUpperCase(),
      value: letter,
      disabled: guessedLetters.has(letter)
    }));

    return new StringSelectMenuBuilder()
      .setCustomId(id)
      .setPlaceholder('Pick a letter')
      .addOptions(options);
  };

  const row1 = new ActionRowBuilder().addComponents(createMenu(chunk1, 'hangman_select_1'));
  const row2 = new ActionRowBuilder().addComponents(createMenu(chunk2, 'hangman_select_2'));

  return [row1, row2];
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
    const maxWrongGuesses = 10;

    const embed = new EmbedBuilder()
      .setTitle('Hangman')
      .setDescription(`Word: ${createWordDisplay(word, guessedLetters)}\nWrong guesses: ${wrongGuesses}/${maxWrongGuesses}`)
      .setColor(0x0099FF);

    await interaction.reply({
      embeds: [embed],
      components: createLetterMenus(guessedLetters)
    });

    const message = await interaction.fetchReply();
    const filter = i => i.customId.startsWith('hangman_select_') && i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 600000 });

    collector.on('collect', async i => {
      const letter = i.values[0];
      if (guessedLetters.has(letter)) {
        await i.reply({ content: 'You already guessed that letter!', flags: 64 });
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
        await i.update({ embeds: [updatedEmbed], components: createLetterMenus(guessedLetters) });
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
