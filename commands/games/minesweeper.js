const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const ROWS = 5;
const COLS = 5;
const MINES_COUNT = 5;
const UNREVEALED = '⬜';
const MINE = '💣';

function createBoard() {
  const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
  let minesPlaced = 0;
  while (minesPlaced < MINES_COUNT) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (board[r][c] !== MINE) {
      board[r][c] = MINE;
      minesPlaced++;
    }
  }
  // Calculate numbers for non-mine cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === MINE) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            if (board[nr][nc] === MINE) count++;
          }
        }
      }
      board[r][c] = count;
    }
  }
  return board;
}

function boardToComponents(board, revealed) {
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < COLS; c++) {
      const key = `${r}_${c}`;
      const isRevealed = revealed.has(key);
      let label = UNREVEALED;
      let style = ButtonStyle.Secondary;
      if (isRevealed) {
        const cell = board[r][c];
        if (cell === MINE) {
          label = MINE;
          style = ButtonStyle.Danger;
        } else if (cell === 0) {
          label = '▫️';
          style = ButtonStyle.Secondary;
        } else {
          label = cell.toString();
          style = ButtonStyle.Primary;
        }
      }
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ms_${r}_${c}`)
          .setLabel(label)
          .setStyle(style)
          .setDisabled(isRevealed)
      );
    }
    rows.push(row);
  }
  return rows;
}

function revealEmptyCells(board, revealed, r, c) {
  const stack = [[r, c]];
  while (stack.length > 0) {
    const [row, col] = stack.pop();
    const key = `${row}_${col}`;
    if (revealed.has(key)) continue;
    revealed.add(key);
    if (board[row][col] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            const nkey = `${nr}_${nc}`;
            if (!revealed.has(nkey)) {
              stack.push([nr, nc]);
            }
          }
        }
      }
    }
  }
}

function checkWin(board, revealed) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const key = `${r}_${c}`;
      if (board[r][c] !== MINE && !revealed.has(key)) {
        return false;
      }
    }
  }
  return true;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('minesweeper')
    .setDescription('Play Minesweeper'),
  cooldown: 10,
  async execute(interaction) {
    const board = createBoard();
    const revealed = new Set();
    let gameOver = false;

    const embed = new EmbedBuilder()
      .setTitle('Minesweeper')
      .setDescription('Click a cell to reveal it. Avoid the mines!')
      .setColor(0x0099FF);

    const message = await interaction.reply({
      embeds: [embed],
      components: boardToComponents(board, revealed),
      fetchReply: true
    });

    const filter = i => i.customId.startsWith('ms_') && i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 600000 });

    collector.on('collect', async i => {
      if (gameOver) {
        await i.reply({ content: 'The game is over!', ephemeral: true });
        return;
      }

      const [_, rStr, cStr] = i.customId.split('_');
      const r = parseInt(rStr);
      const c = parseInt(cStr);
      const key = `${r}_${c}`;

      if (revealed.has(key)) {
        await i.reply({ content: 'This cell is already revealed!', ephemeral: true });
        return;
      }

      if (board[r][c] === '💣') {
        revealed.add(key);
        gameOver = true;
        const loseEmbed = new EmbedBuilder()
          .setTitle('Minesweeper - Game Over')
          .setDescription('💥 You hit a mine! Game over.')
          .setColor(0xFF0000);
        await i.update({ embeds: [loseEmbed], components: boardToComponents(board, revealed).map(row => {
          row.components.forEach(button => button.setDisabled(true));
          return row;
        }) });
        collector.stop();
        return;
      } else {
        revealEmptyCells(board, revealed, r, c);
        if (checkWin(board, revealed)) {
          gameOver = true;
          const winEmbed = new EmbedBuilder()
            .setTitle('Minesweeper - You Win!')
            .setDescription('🎉 You revealed all safe cells!')
            .setColor(0x00FF00);
          await i.update({ embeds: [winEmbed], components: boardToComponents(board, revealed).map(row => {
            row.components.forEach(button => button.setDisabled(true));
            return row;
          }) });
          collector.stop();
          return;
        } else {
          const ongoingEmbed = new EmbedBuilder()
            .setTitle('Minesweeper')
            .setDescription('Click a cell to reveal it. Avoid the mines!')
            .setColor(0x0099FF);
          await i.update({ embeds: [ongoingEmbed], components: boardToComponents(board, revealed) });
        }
      }
    });

    collector.on('end', async collected => {
      if (!gameOver) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('Minesweeper')
          .setDescription('Game ended due to inactivity.')
          .setColor(0xFF0000);
        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  },
};
