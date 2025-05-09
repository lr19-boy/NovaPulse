require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  REST,
  Routes,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const logger = require('./utils/logger');

// Log bot startup
console.log("🚀 Starting NovaPulse...");
// Check if required environment variables are set
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const config = {
  TOKEN: process.env.TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID
}

  
// Create the Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel, Partials.Message],
});

// Set the client in logger for Discord channel logging
logger.setClient(client);

// Collections for commands and cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();  

// === Load Commands ===
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

if (commandFolders.length === 0) {
  console.warn("⚠️ No command folders found in the /commands directory.");
}

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".js"));

  if (commandFiles.length === 0) {
    console.warn(
      `⚠️ No command files found in the /commands/${folder} folder.`,
    );
  }

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
      console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
      console.warn(
        `⚠️  The command at ${filePath} is missing "data" or "execute".`,
      );
    }
  }
}

// === Deploy Commands ===
const rest = new REST().setToken(TOKEN);

(async () => {
  try {
    if (commands.length === 0) {
      console.warn("[WARNING] No commands found to deploy.");
      return;
    }

    console.log(
      `Started refreshing ${commands.length} application (/) command(s).`,
    );

    let data;

    if (GUILD_ID) {
      data = await rest.put(
        Routes.applicationGuildCommands(
          CLIENT_ID,
          GUILD_ID,
        ),
        { body: commands },
      );
      console.log(`✅ Successfully reloaded ${data.length} guild command(s).`);
    } else {
      data = await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: commands,
      });
      console.log(`✅ Successfully reloaded ${data.length} global command(s).`);
    }
  } catch (error) {
    console.error("[ERROR] Failed to register commands:", error);
  }
})();

client.once("ready", () => {
  console.log(`✅ Ready! Logged in as ${client.user.tag}`);

  const activities = [
    { name: "with NovaPulse ⚡", type: 2, status: "online" },
    { name: "your commands", type: 0, status: "idle" },
    { name: "the server", type: 3, status: "dnd" },
    { name: "for new users", type: 1, status: "online" },
  ];

  let i = 0;
  setInterval(() => {
    client.user.setPresence({
      activities: [activities[i]],
      status: activities[i].status || "online",
    });
    i = (i + 1) % activities.length;
  }, 15000); // Change activity every 15 seconds

  console.log(`✅ Loaded one-time event: ready`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(
      `No command matching ${interaction.commandName} was found.`,
    );
    return;
  }

  // Set up cooldown management
  const { cooldowns } = interaction.client;

  // Initialize cooldown collection for the command if it doesn't exist
  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name);
  const cooldownAmount = (command.cooldown || 3) * 1000; // Default cooldown is 3 seconds

  if (timestamps.has(interaction.user.id)) {
    const expirationTime =
      timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000; // Time left in seconds
      await interaction.reply({
        content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.data.name}\` command.`,
        ephemeral: true,
      });
      return interaction.fetchReply();
    }
  }

  // Set the timestamp for the user executing the command
  timestamps.set(interaction.user.id, now);

  // Delete the user's timestamp after the cooldown expires
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  try {
    // Execute the command
    await command.execute(interaction);
  } catch (error) {
    console.error(
      `[ERROR] Failed to execute command: ${command.data.name}`,
      error,
    );

    // Handle errors and provide feedback to the user
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
      return interaction.fetchReply();
    }
  }
});

// === Global Error Handling ===
process.on("unhandledRejection", (error) => {
  console.error("🚨 Unhandled promise rejection:", error);
});

// === Login to Discord ===
client.login(config.TOKEN);
