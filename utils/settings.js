const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../data/user_settings.json');

function ensureDataDir() {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

function loadSettings() {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE)) {
        try {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return {};
        }
    }
    return {};
}

function saveSettings(settings) {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

function getUserSettings(userId) {
    const allSettings = loadSettings();
    return allSettings[userId] || {
        browser: 'chrome',
        performanceMode: false,
        updateInterval: 5000,
        darkMode: true,
        adBlock: true
    };
}

function setUserSettings(userId, settings) {
    const allSettings = loadSettings();
    allSettings[userId] = { ...getUserSettings(userId), ...settings };
    saveSettings(allSettings);
}

module.exports = {
    getUserSettings,
    setUserSettings
};