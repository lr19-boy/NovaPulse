const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all available commands or get help for a specific command')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The command to get help for')
        .setRequired(false)),
  cooldown: 5,
  async execute(interaction) {
    const commandName = interaction.options.getString('command');
    const commands = interaction.client.commands;

    if (commandName) {
      const command = commands.get(commandName);
      if (!command) {
        await interaction.reply({ content: `Command \`${commandName}\` not found.`, ephemeral: true });
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(`Help: /${command.data.name}`)
        .addFields(
          { name: 'Name', value: command.data.name, inline: true },
          { name: 'Description', value: command.data.description, inline: true }
        )
        .setColor(0x00AE86);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

      const embed = new EmbedBuilder()
        .setTitle('Available Commands')
        .setDescription('Select a command from the dropdown menu to get help.')
        .setColor(0x00AE86);

      const limitedCommands = Array.from(commands.values()).slice(0, 25);

      const options = limitedCommands.map(cmd => ({
        label: `/${cmd.data.name}`,
        description: cmd.data.description,
        value: cmd.data.name,
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help-select')
        .setPlaceholder('Select a command to get help')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
    logger.info(`Help command used by ${interaction.user.tag}`);
  },
};
