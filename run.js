const browse = require('./index.js');
const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.bold.magenta('\n🌐 Bolt-ie Bot Starting...'));

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// Customizable bot status configuration
const BOT_STATUS = process.env.BOT_STATUS || 'online';
const BOT_ACTIVITY_TYPE = process.env.BOT_ACTIVITY_TYPE || '3';
const BOT_ACTIVITY_NAME = process.env.BOT_ACTIVITY_NAME || 'Use /browse to start browsing!';

if (!DISCORD_TOKEN || !GUILD_ID) {
    console.log(chalk.red('✗ Missing DISCORD_TOKEN or GUILD_ID'));
    process.exit(1);
}

try {
    const chromiumPath = execSync('command -v chromium-browser || command -v chromium', { encoding: 'utf8' }).trim();
    if (chromiumPath) {
        process.env.PUPPETEER_EXECUTABLE_PATH = chromiumPath;
    }
} catch (e) {
    // Silently fall back to bundled Chrome
}

browse(DISCORD_TOKEN, GUILD_ID, 600000, true, {
    status: BOT_STATUS,
    activityType: parseInt(BOT_ACTIVITY_TYPE),
    activityName: BOT_ACTIVITY_NAME
});
