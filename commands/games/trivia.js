const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Play a trivia game')
    .addStringOption(option =>
      option.setName('difficulty')
        .setDescription('Select difficulty')
        .addChoices(
          { name: 'Easy', value: 'easy' },
          { name: 'Medium', value: 'medium' },
          { name: 'Hard', value: 'hard' }
        )
        .setRequired(false)),
  cooldown: 10,
  async execute(interaction) {
    const difficulty = interaction.options.getString('difficulty') || 'medium';
    
    const triviaQuestions = {
      easy: [
        {
          question: "What is the capital of France?",
          answers: ["Paris", "London", "Berlin", "Madrid"],
          correct: 0
        },
        {
          question: "What is 2 + 2?",
          answers: ["3", "4", "5", "6"],
          correct: 1
        },
        {
          question: "What color do you get when you mix red and white?",
          answers: ["Pink", "Purple", "Orange", "Brown"],
          correct: 0
        },
        {
          question: "Which animal is known as man's best friend?",
          answers: ["Cat", "Dog", "Horse", "Parrot"],
          correct: 1
        }
      ],
      medium: [
        {
          question: "Which element has the chemical symbol 'Fe'?",
          answers: ["Fluorine", "Iron", "Francium", "Fermium"],
          correct: 1
        },
        {
          question: "Who painted the Mona Lisa?",
          answers: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
          correct: 2
        },
        {
          question: "What is the largest planet in our solar system?",
          answers: ["Earth", "Saturn", "Jupiter", "Mars"],
          correct: 2
        },
        {
          question: "What is the boiling point of water at sea level in Celsius?",
          answers: ["90°C", "100°C", "110°C", "120°C"],
          correct: 1
        }
      ],
      hard: [
        {
          question: "In what year was the first transistor invented?",
          answers: ["1947", "1957", "1937", "1967"],
          correct: 0
        },
        {
          question: "What is the largest moon of Saturn?",
          answers: ["Enceladus", "Rhea", "Titan", "Mimas"],
          correct: 2
        },
        {
          question: "What is the chemical formula for table salt?",
          answers: ["NaCl", "KCl", "Na2SO4", "CaCl2"],
          correct: 0
        },
        {
          question: "Who developed the theory of general relativity?",
          answers: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Galileo Galilei"],
          correct: 1
        }
      ]
    };
    
    const questions = triviaQuestions[difficulty];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    const row = new ActionRowBuilder();
    
    for (let i = 0; i < randomQuestion.answers.length; i++) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`trivia_${i}`)
          .setLabel(randomQuestion.answers[i])
          .setStyle(ButtonStyle.Primary)
      );
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Trivia Question')
      .setDescription(randomQuestion.question)
      .setFooter({ text: `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` });
    
    const response = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });
    
    const filter = i => i.customId.startsWith('trivia_') && i.user.id === interaction.user.id;
    const collector = response.createMessageComponentCollector({ filter, time: 15000 });
    
    collector.on('collect', async i => {
      const selectedAnswer = parseInt(i.customId.split('_')[1]);
      
      const resultEmbed = new EmbedBuilder()
        .setColor(selectedAnswer === randomQuestion.correct ? 0x00FF00 : 0xFF0000)
        .setTitle(selectedAnswer === randomQuestion.correct ? 'Correct!' : 'Wrong!')
        .setDescription(`The correct answer was: ${randomQuestion.answers[randomQuestion.correct]}`)
        .setFooter({ text: `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` });
      
      await i.update({ embeds: [resultEmbed], components: [] });
      collector.stop();
    });
    
    collector.on('end', async collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('Time\'s up!')
          .setDescription(`The correct answer was: ${randomQuestion.answers[randomQuestion.correct]}`)
          .setFooter({ text: `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` });
        
        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  },
};
