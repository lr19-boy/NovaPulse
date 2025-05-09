const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const EMPTY = '⬜';
const PLAYER_X = '❌';
const PLAYER_O = '⭕';

function checkWinner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // columns
    [0,4,8],[2,4,6]          // diagonals
  ];
  for (const [a,b,c] of lines) {
    if (board[a] !== EMPTY && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every(cell => cell !== EMPTY);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Play a game of Tic-Tac-Toe with another user')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('The user to challenge')
        .setRequired(true)
    ),
  cooldown: 10,
  async execute(interaction) {
    const opponent = interaction.options.getUser('opponent');
    if (opponent.bot) {
      return interaction.reply({ content: 'You cannot challenge a bot!', ephemeral: true });
    }
    if (opponent.id === interaction.user.id) {
      return interaction.reply({ content: 'You cannot challenge yourself!', ephemeral: true });
    }

    let board = Array(9).fill(EMPTY);
    let currentPlayer = PLAYER_X;
    let players = {
      [PLAYER_X]: interaction.user.id,
      [PLAYER_O]: opponent.id
    };

    const createBoardComponents = () => {
      const rows = [];
      for (let i = 0; i < 3; i++) {
        const row = new ActionRowBuilder();
        for (let j = 0; j < 3; j++) {
          const idx = i * 3 + j;
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`ttt_${idx}`)
              .setLabel(board[idx])
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(board[idx] !== EMPTY)
          );
        }
        rows.push(row);
      }
      return rows;
    };

    const embed = new EmbedBuilder()
      .setTitle('Tic-Tac-Toe')
      .setDescription(`It's <@${players[currentPlayer]}>'s turn (${currentPlayer})`)
      .setColor(0x0099FF);

    const message = await interaction.reply({
      embeds: [embed],
      components: createBoardComponents(),
      fetchReply: true
    });

    const filter = i => i.customId.startsWith('ttt_') && (i.user.id === players[PLAYER_X] || i.user.id === players[PLAYER_O]);
    const collector = message.createMessageComponentCollector({ filter, time: 600000 });

    collector.on('collect', async i => {
      if (i.user.id !== players[currentPlayer]) {
        await i.reply({ content: "It's not your turn!", ephemeral: true });
        return;
      }

      const idx = parseInt(i.customId.split('_')[1]);
      if (board[idx] !== EMPTY) {
        await i.reply({ content: "This spot is already taken!", ephemeral: true });
        return;
      }

      board[idx] = currentPlayer;

      const winner = checkWinner(board);
      const full = isBoardFull(board);

      if (winner) {
        const winEmbed = new EmbedBuilder()
          .setTitle('Tic-Tac-Toe')
          .setDescription(`<@${players[winner]}> (${winner}) wins!`)
          .setColor(0x00FF00);

        await i.update({ embeds: [winEmbed], components: createBoardComponents().map(row => {
          row.components.forEach(button => button.setDisabled(true));
          return row;
        }) });
        collector.stop();
        return;
      } else if (full) {
        const drawEmbed = new EmbedBuilder()
          .setTitle('Tic-Tac-Toe')
          .setDescription(`It's a draw!`)
          .setColor(0xFFFF00);

        await i.update({ embeds: [drawEmbed], components: createBoardComponents().map(row => {
          row.components.forEach(button => button.setDisabled(true));
          return row;
        }) });
        collector.stop();
        return;
      } else {
        currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
        const turnEmbed = new EmbedBuilder()
          .setTitle('Tic-Tac-Toe')
          .setDescription(`It's <@${players[currentPlayer]}>'s turn (${currentPlayer})`)
          .setColor(0x0099FF);

        await i.update({ embeds: [turnEmbed], components: createBoardComponents() });
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('Tic-Tac-Toe')
          .setDescription('Game ended due to inactivity.')
          .setColor(0xFF0000);

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  },
};
