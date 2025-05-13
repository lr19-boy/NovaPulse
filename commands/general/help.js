const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all available commands or get help for a specific command')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The command to get detailed help for')
        .setRequired(false)),
  cooldown: 5,

  async execute(interaction) {
    const commandName = interaction.options.getString('command');
    const commands = interaction.client.commands;

    if (!commands || commands.size === 0) {
      await interaction.reply({ content: '❌ No commands found.', ephemeral: true });
      return;
    }

    if (commandName) {
      const command = commands.get(commandName);
      if (!command) {
        await interaction.reply({ content: `❌ Command \`${commandName}\` not found.`, ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`📖 Help: /${command.data.name}`)
        .addFields(
          { name: '📝 Description', value: command.data.description, inline: false },
          { name: '⏳ Cooldown', value: `${command.cooldown || 0} seconds`, inline: true },
          ...(command.usage ? [{ name: '📌 Usage', value: `\`${command.usage}\``, inline: false }] : [])
        )
        .setColor(0x00AE86)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('📚 Available Commands')
        .setDescription('Use the dropdown below to select a command and see its details.')
        .setColor(0x00AE86)
        .setFooter({ text: `Total commands: ${commands.size}` })
        .setTimestamp();

      const limitedCommands = Array.from(commands.values()).slice(0, 25);

      const options = limitedCommands.map(cmd => ({
        label: `/${cmd.data.name}`,
        description: cmd.data.description.length > 50 ? cmd.data.description.slice(0, 47) + '...' : cmd.data.description,
        value: cmd.data.name,
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help-select')
        .setPlaceholder('📖 Select a command')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
    }

    logger.info(`Help command used by ${interaction.user.tag}`);
  },
};
