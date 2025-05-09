const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function getCardValue(card) {
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  if (card.rank === 'A') return 11;
  return parseInt(card.rank);
}

function calculateHandValue(hand) {
  let value = 0;
  let aces = 0;
  for (const card of hand) {
    value += getCardValue(card);
    if (card.rank === 'A') aces++;
  }
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return value;
}

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i +1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function handToString(hand) {
  return hand.map(card => `${card.rank}${card.suit}`).join(' ');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Play a simple game of Blackjack'),
  cooldown: 10,
  async execute(interaction) {
    const deck = shuffle(createDeck());
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];

    let playerValue = calculateHandValue(playerHand);
    let dealerValue = calculateHandValue(dealerHand);

    const embed = new EmbedBuilder()
      .setTitle('Blackjack')
      .setDescription(`Your hand: ${handToString(playerHand)} (Value: ${playerValue})\nDealer's hand: ${dealerHand[0].rank}${dealerHand[0].suit} ??`)
      .setColor(0x0099FF);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('hit')
          .setLabel('Hit')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('stand')
          .setLabel('Stand')
          .setStyle(ButtonStyle.Secondary)
      );

    const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const filter = i => (i.customId === 'hit' || i.customId === 'stand') && i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 600000 });

    let currentPlayerHand = playerHand;
    let currentDealerHand = dealerHand;
    let currentDeck = deck;
    let currentPlayerValue = playerValue;
    let currentDealerValue = dealerValue;
    let gameOver = false;

    const updateMessage = async () => {
      const embedUpdate = new EmbedBuilder()
        .setTitle('Blackjack')
        .setDescription(`Your hand: ${handToString(currentPlayerHand)} (Value: ${currentPlayerValue})\nDealer's hand: ${currentDealerHand[0].rank}${currentDealerHand[0].suit} ??`)
        .setColor(0x0099FF);
      await message.edit({ embeds: [embedUpdate], components: [row] });
    };

    collector.on('collect', async i => {
      if (gameOver) {
        await i.reply({ content: 'The game is over!', ephemeral: true });
        return;
      }

      if (i.customId === 'hit') {
        currentPlayerHand.push(currentDeck.pop());
        currentPlayerValue = calculateHandValue(currentPlayerHand);

        if (currentPlayerValue > 21) {
          gameOver = true;
          const embedLose = new EmbedBuilder()
            .setTitle('Blackjack - You Busted!')
            .setDescription(`Your hand: ${handToString(currentPlayerHand)} (Value: ${currentPlayerValue})\nDealer's hand: ${handToString(currentDealerHand)} (Value: ${currentDealerValue})\n\nYou busted! You lose.`)
            .setColor(0xFF0000);
          await i.update({ embeds: [embedLose], components: [] });
          collector.stop();
          return;
        } else {
          await updateMessage();
          await i.deferUpdate();
        }
      } else if (i.customId === 'stand') {
        gameOver = true;
        // Dealer's turn
        while (currentDealerValue < 17) {
          currentDealerHand.push(currentDeck.pop());
          currentDealerValue = calculateHandValue(currentDealerHand);
        }

        let result;
        if (currentDealerValue > 21) {
          result = 'Dealer busted! You win!';
        } else if (currentDealerValue === currentPlayerValue) {
          result = 'It\'s a tie!';
        } else if (currentDealerValue > currentPlayerValue) {
          result = 'Dealer wins!';
        } else {
          result = 'You win!';
        }

        const embedResult = new EmbedBuilder()
          .setTitle('Blackjack - Game Over')
          .setDescription(`Your hand: ${handToString(currentPlayerHand)} (Value: ${currentPlayerValue})\nDealer's hand: ${handToString(currentDealerHand)} (Value: ${currentDealerValue})\n\n${result}`)
          .setColor(result.includes('win') ? 0x00FF00 : result.includes('tie') ? 0xFFFF00 : 0xFF0000);

        await i.update({ embeds: [embedResult], components: [] });
        collector.stop();
      }
    });

    collector.on('end', async collected => {
      if (!gameOver) {
        const embedTimeout = new EmbedBuilder()
          .setTitle('Blackjack')
          .setDescription('Game ended due to inactivity.')
          .setColor(0xFF0000);
        await interaction.editReply({ embeds: [embedTimeout], components: [] });
      }
    });
  },
};
