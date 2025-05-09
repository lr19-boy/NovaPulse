const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'economy.json');

function ensureDataFile() {
  if (!fs.existsSync(path.dirname(dataFilePath))) {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({}));
  }
}

function readEconomyData() {
  ensureDataFile();
  const rawData = fs.readFileSync(dataFilePath);
  return JSON.parse(rawData);
}

function writeEconomyData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

function getBalance(userId) {
  const data = readEconomyData();
  return data[userId]?.balance || 0;
}

function setBalance(userId, amount) {
  const data = readEconomyData();
  if (!data[userId]) {
    data[userId] = {};
  }
  data[userId].balance = amount;
  writeEconomyData(data);
}

function addBalance(userId, amount) {
  const current = getBalance(userId);
  setBalance(userId, current + amount);
}

function subtractBalance(userId, amount) {
  const current = getBalance(userId);
  setBalance(userId, Math.max(0, current - amount));
}

function getAllBalances() {
  const data = readEconomyData();
  return data;
}

module.exports = {
  getBalance,
  setBalance,
  addBalance,
  subtractBalance,
  getAllBalances,
};
