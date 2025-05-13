const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('github')
    .setDescription('Fetch GitHub user information')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('GitHub username to look up')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const username = interaction.options.getString('username');
    const url = `https://api.github.com/users/${username}`;

    try {
      const response = await axios.get(url);
      const user = response.data;

      await interaction.reply({
        embeds: [
          {
            title: `${user.login}'s GitHub Profile`,
            url: user.html_url,
            color: 0x24292e,
            thumbnail: { url: user.avatar_url },
            fields: [
              { name: 'Name', value: user.name || 'N/A', inline: true },
              { name: 'Public Repos', value: `${user.public_repos}`, inline: true },
              { name: 'Followers', value: `${user.followers}`, inline: true },
              { name: 'Following', value: `${user.following}`, inline: true },
              { name: 'Bio', value: user.bio || 'N/A' },
            ],
            footer: { text: 'Powered by GitHub API' },
            timestamp: new Date()
          }
        ]
      });
    } catch (error) {
      console.error(error);
      await interaction.reply(`❌ Could not fetch info for **${username}**.`);
    }
  }
};
