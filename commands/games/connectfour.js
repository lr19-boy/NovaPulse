const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const ROWS = 6;
const COLS = 7;
const EMPTY = '⚪';
const PLAYER1 = '🔴';
const PLAYER2 = '🟡';

function createBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));
}

function boardToComponents(board) {
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < COLS; c++) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`cf_${r}_${c}`)
          .setLabel(board[r][c])
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
    }
    rows.push(row);
  }
  // Add column buttons for dropping discs
  const colButtons = new ActionRowBuilder();
  for (let c = 0; c < COLS; c++) {
    colButtons.addComponents(
      new ButtonBuilder()
        .setCustomId(`cf_drop_${c}`)
        .setLabel((c+1).toString())
        .setStyle(ButtonStyle.Primary)
    );
  }
  rows.push(colButtons);
  return rows;
}

function dropDisc(board, col, disc) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) {
      board[r][col] = disc;
      return r;
    }
  }
  return -1; // Column full
}

function checkWinner(board, disc) {
  // Check horizontal, vertical, diagonal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== disc) continue;
      // Horizontal
      if (c + 3 < COLS &&
          board[r][c+1] === disc &&
          board[r][c+2] === disc &&
          board[r][c+3] === disc) return true;
      // Vertical
      if (r + 3 < ROWS &&
          board[r+1][c] === disc &&
          board[r+2][c] === disc &&
          board[r+3][c] === disc) return true;
      // Diagonal down-right
      if (r + 3 < ROWS && c + 3 < COLS &&
          board[r+1][c+1] === disc &&
          board[r+2][c+2] === disc &&
          board[r+3][c+3] === disc) return true;
      // Diagonal down-left
      if (r + 3 < ROWS && c - 3 >= 0 &&
          board[r+1][c-1] === disc &&
          board[r+2][c-2] === disc &&
          board[r+3][c-3] === disc) return true;
    }
  }
  return false;
}

function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== EMPTY));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connectfour')
    .setDescription('Play Connect Four with another user')
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

    let board = createBoard();
    let currentPlayer = PLAYER1;
    let players = {
      [PLAYER1]: interaction.user.id,
      [PLAYER2]: opponent.id
    };

    const embed = new EmbedBuilder()
      .setTitle('Connect Four')
      .setDescription(`It's <@${players[currentPlayer]}>'s turn (${currentPlayer})`)
      .setColor(0x0099FF);

    const message = await interaction.reply({
      embeds: [embed],
      components: boardToComponents(board),
      fetchReply: true
    });

    const filter = i => i.customId.startsWith('cf_drop_') && (i.user.id === players[PLAYER1] || i.user.id === players[PLAYER2]);
    const collector = message.createMessageComponentCollector({ filter, time: 600000 });

    collector.on('collect', async i => {
      if (i.user.id !== players[currentPlayer]) {
        await i.reply({ content: "It's not your turn!", ephemeral: true });
        return;
      }

      const col = parseInt(i.customId.split('_')[2]);
      const row = dropDisc(board, col, currentPlayer);

      if (row === -1) {
        await i.reply({ content: "That column is full! Choose another one.", ephemeral: true });
        return;
      }

      const winner = checkWinner(board, currentPlayer);
      const full = isBoardFull(board);

      if (winner) {
        const winEmbed = new EmbedBuilder()
          .setTitle('Connect Four')
          .setDescription(`<@${players[currentPlayer]}> (${currentPlayer}) wins!`)
          .setColor(0x00FF00);

        await i.update({ embeds: [winEmbed], components: boardToComponents(board).map(row => {
          row.components.forEach(button => button.setDisabled(true));
          return row;
        }) });
        collector.stop();
        return;
      } else if (full) {
        const drawEmbed = new EmbedBuilder()
          .setTitle('Connect Four')
          .setDescription(`It's a draw!`)
          .setColor(0xFFFF00);

        await i.update({ embeds: [drawEmbed], components: boardToComponents(board).map(row => {
          row.components.forEach(button => button.setDisabled(true));
          return row;
        }) });
        collector.stop();
        return;
      } else {
        currentPlayer = currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
        const turnEmbed = new EmbedBuilder()
          .setTitle('Connect Four')
          .setDescription(`It's <@${players[currentPlayer]}>'s turn (${currentPlayer})`)
          .setColor(0x0099FF);

        await i.update({ embeds: [turnEmbed], components: boardToComponents(board) });
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('Connect Four')
          .setDescription('Game ended due to inactivity.')
          .setColor(0xFF0000);

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  },
};
