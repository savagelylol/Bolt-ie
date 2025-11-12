const browse = require('./index.js');
const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.bold.magenta('     🌐 Browser Buddy BOT'));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// Customizable bot status configuration
const BOT_STATUS = process.env.BOT_STATUS || 'online'; // online, idle, dnd, invisible
const BOT_ACTIVITY_TYPE = process.env.BOT_ACTIVITY_TYPE || '3'; // 0: Playing, 1: Streaming, 2: Listening, 3: Watching, 5: Competing
const BOT_ACTIVITY_NAME = process.env.BOT_ACTIVITY_NAME || 'Use /browse to start browsing!';

if (!DISCORD_TOKEN || !GUILD_ID) {
    console.log(chalk.red.bold('✗ Error: Missing required environment variables!'));
    console.log(chalk.yellow('  Please set DISCORD_TOKEN and GUILD_ID in your environment variables.'));
    console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    process.exit(1);
}

console.log(chalk.green('✓ Environment variables loaded'));

try {
    const chromiumPath = execSync('command -v chromium-browser || command -v chromium', { encoding: 'utf8' }).trim();
    if (chromiumPath) {
        process.env.PUPPETEER_EXECUTABLE_PATH = chromiumPath;
        console.log(chalk.green('✓ Using system Chromium'));
        console.log(chalk.dim('  Path:'), chalk.dim(chromiumPath));
    }
} catch (e) {
    console.log(chalk.yellow('⚠️  Could not find system Chromium'));
    console.log(chalk.dim('   Puppeteer will use bundled Chrome'));
}

console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.bold.white('     Initializing bot...'));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

browse(DISCORD_TOKEN, GUILD_ID, 600000, true, {
    status: BOT_STATUS,
    activityType: parseInt(BOT_ACTIVITY_TYPE),
    activityName: BOT_ACTIVITY_NAME
});
