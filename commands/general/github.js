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
    )
    .addBooleanOption(option =>
      option.setName('repos')
        .setDescription('Show user’s public repositories')
        .setRequired(false)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const showRepos = interaction.options.getBoolean('repos') || false;
    const userUrl = `https://api.github.com/users/${username}`;

    // Defer the reply to prevent interaction timeout
    await interaction.deferReply();

    try {
      const userResponse = await axios.get(userUrl);
      const user = userResponse.data;

      let embed = {
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
      };

      if (showRepos) {
        const reposUrl = `https://api.github.com/users/${username}/repos?per_page=5&sort=updated`;
        const reposResponse = await axios.get(reposUrl);
        const repos = reposResponse.data;

        if (repos.length > 0) {
          const repoList = repos.map(repo => `[${repo.name}](${repo.html_url}) ⭐${repo.stargazers_count}`).join('\n');
          embed.fields.push({
            name: 'Recent Public Repos',
            value: repoList
          });
        } else {
          embed.fields.push({
            name: 'Public Repos',
            value: 'No public repositories found.'
          });
        }
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply(`❌ Could not fetch info for **${username}**.`);
    }
  }
};
