const browse = require('./index.js');
const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.bold.magenta('\n🌐 Chromie Bot Starting...'));

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// Customizable bot status configuration
const BOT_STATUS = process.env.BOT_STATUS || 'online';
const BOT_ACTIVITY_TYPE = process.env.BOT_ACTIVITY_TYPE || '3';
const BOT_ACTIVITY_NAME = process.env.BOT_ACTIVITY_NAME || 'Use /browse to start browsing!';

if (!DISCORD_TOKEN) {
    console.log(chalk.red('✗ Missing DISCORD_TOKEN'));
    console.log(chalk.yellow('ℹ️  Add your bot token in the Secrets tool'));
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

browse(DISCORD_TOKEN, 600000, true, {
    status: BOT_STATUS,
    activityType: parseInt(BOT_ACTIVITY_TYPE),
    activityName: BOT_ACTIVITY_NAME
});

console.log(chalk.green('\n✅ Bot is now running as a public bot!'));
console.log(chalk.cyan('📋 Invite link: https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=414464724032&scope=bot%20applications.commands'));
console.log(chalk.yellow('   Replace YOUR_CLIENT_ID with your bot\'s client ID from the Discord Developer Portal\n'));
