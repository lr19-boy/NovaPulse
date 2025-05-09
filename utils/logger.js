const fs = require('fs');
const path = require('path');

let discordClient = null;
const logChannelId = '1212799087519469598';

const logFilePath = path.join(__dirname, '..', 'logs', 'bot.log');

function ensureLogFile() {
  const logDir = path.dirname(logFilePath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '');
  }
}

function formatDate(date) {
  return date.toISOString();
}

function logToFile(level, message) {
  ensureLogFile();
  const logMessage = `[${formatDate(new Date())}] [${level}] ${message}\n`;
  fs.appendFile(logFilePath, logMessage, err => {
    if (err) console.error('Failed to write log:', err);
  });
}

async function sendToDiscord(level, message) {
  if (!discordClient) return;
  try {
    const channel = await discordClient.channels.fetch(logChannelId);
    if (channel) {
      await channel.send(`[${level}] ${message}`);
    }
  } catch (error) {
    console.error('Failed to send log to Discord channel:', error);
  }
}

module.exports = {
  setClient: (client) => {
    discordClient = client;
  },
  info: async (message) => {
    console.log(`[INFO] ${message}`);
    logToFile('INFO', message);
    await sendToDiscord('INFO', message);
  },
  warn: async (message) => {
    console.warn(`[WARN] ${message}`);
    logToFile('WARN', message);
    await sendToDiscord('WARN', message);
  },
  error: async (message) => {
    console.error(`[ERROR] ${message}`);
    logToFile('ERROR', message);
    await sendToDiscord('ERROR', message);
  },
};
