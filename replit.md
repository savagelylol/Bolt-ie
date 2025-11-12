# Discordmium

## Overview
Discordmium is a Discord bot that brings a Chromium browser instance into Discord. Users can control a virtual browser through Discord slash commands and button interactions.

**Warning**: This bot is meant for self-use only in private servers, as users have full control over a browser instance.

## Project Architecture
- **Language**: Node.js
- **Main Dependencies**:
  - `eris`: Discord bot library
  - `puppeteer`: Headless Chrome automation (for Chrome browser)
  - `playwright`: Browser automation (for Firefox browser)
- **Entry Point**: `run.js` (calls the exported function from `index.js`)
- **Structure**:
  - `index.js`: Main bot logic and browser control
  - `utils/browserAdapter.js`: Dual-browser adapter for Puppeteer/Playwright
  - `utils/plugin.js`: Browser plugin for visual mouse cursor
  - `utils/interactionCollector.js`: Discord interaction handler
  - `run.js`: Bot runner with environment variable loading

## Configuration

### Required Environment Variables
- `DISCORD_TOKEN`: Discord bot token from Discord Developer Portal
- `GUILD_ID`: Discord server ID where the bot will operate

### Bot Setup Instructions
1. **Create a Discord Bot Application**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the "Bot" section and create a bot
   - Enable "Message Content Intent" under Privileged Gateway Intents
   - Copy the bot token

2. **Invite Bot to Your Server**:
   - In the Developer Portal, go to OAuth2 > URL Generator
   - Select scopes: `bot` and `applications.commands`
   - Select bot permissions: `Send Messages`, `Attach Files`, `Read Messages/View Channels`
   - Copy the generated URL and open it in your browser to invite the bot

3. **Get Your Server ID**:
   - Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
   - Right-click on your server and select "Copy Server ID"

## How It Works
1. Bot connects to Discord using Eris
2. Launches a Puppeteer browser instance
3. Registers a `/browse` slash command for the specified guild
4. Users can interact with the browser through Discord buttons (movement, clicking, typing)
5. Each user session has a time limit (default: 5 minutes)
6. Includes content filtering for suspicious URLs and keywords

## Browser Support

### Chrome (Puppeteer)
- Default browser, uses system Chromium
- Fully tested and stable
- Sandbox disabled for Replit environment compatibility

### Firefox (Playwright)
- Available as an alternative browser option
- Uses Playwright's bundled Firefox browser
- Sandbox disabled for Replit environment compatibility
- First launch may take longer (3 minutes) while Playwright downloads Firefox
- Select Firefox using `/browse browser:Firefox`

## Recent Changes

### 2025-11-12: Dual-Browser Support (v2.2.0)
- **Added Firefox support via Playwright** - Users can now choose between Chrome and Firefox
- **Browser selection** - Use `/browse browser:Firefox` or `/browse browser:Chrome`
- **BrowserAdapter architecture** - New adapter layer normalizes Puppeteer (Chrome) and Playwright (Firefox) APIs
- **Sandbox configuration** - Both browsers configured to run in Replit's containerized environment
- **Automatic fallback** - If Firefox fails to launch, automatically falls back to Chrome
- **System dependencies** - Installed X11 libraries and GTK3 for Firefox support

### 2025-11-04: v2.0.0 - Cleaner Interface Update
- 🎨 **Streamlined button layout** - Reduced from 20 to 16 buttons for better UX
- 🎨 **Better organization** - New 4-row layout (3-4-5-4 buttons)
  - Row 1: x25, x50, x100 (removed x10 and x75)
  - Row 2: Back, Forward, Reset, History
  - Row 3: Left, Up, Click, Down, Right
  - Row 4: Type, Enter, Scroll Up, Scroll Down
- 🎨 **Added version footer** - All embeds now display "Discordmium v2.0.0 • Browser Buddy"
- 🎨 **BOT_VERSION constant** - Easy version management at top of index.js
- 🎨 **Improved button labels** - Added emoji to key buttons (⌨️ Type, 🖱️ Click, 🔄 Reset, ↵ Enter)
- 🎨 **Consistent branding** - Changed embed color to cyan blue throughout

### 2025-11-04: Major Feature Overhaul
- **Fixed typing feature** - Critical bug fix where Type button wasn't working (changed `interaction.createMessage()` to `bot.createMessage(interaction.channel.id, ...)`)
- **NEW: /presets command** - Quick access to 10 popular websites:
  - Google, YouTube, GitHub, Twitter, Reddit, Wikipedia, Discord, Stack Overflow, Amazon, Twitch
  - Beautiful button interface for one-click browsing
- **Scroll functionality** - Added scroll up/down buttons (500px per click)
- **Navigation controls** - Back and Forward buttons using browser history
- **History tracking** - View last 10 URLs visited in the current session
- **Improved button layout** - Reorganized from 3 to 4 rows for better UX:
  - Row 1: Mouse sensitivity (x10, x25, x50, x75, x100)
  - Row 2: Navigation (Back, Forward, Up, Reset, History)
  - Row 3: Cursor movement (Left, Click, Down, Right, Scroll Up)
  - Row 4: Input & Actions (Type, Enter, Tab, Clear, Scroll Down)
- **Fixed message deletion bug** - Fixed unescaped characters error when deleting messages
- Updated documentation (README.md and CHANGELOG.md) with all new features

### 2025-11-03: Imported to Replit
- Created `run.js` runner script with dynamic Chromium path detection
- Configured workflow to run the bot
- Installed system Chromium package for Puppeteer
- Updated Puppeteer launch options for Replit environment (no-sandbox flags)
- Added setup documentation (SETUP.md)
- **Added beautiful colorful logging** throughout the application using chalk
- **Fixed URL validation regex** that was causing "Please provide a valid URL" errors
- Added comprehensive logging for all user interactions (commands, mouse movements, keyboard input)
- **Fixed image embedding** - Images now show inline instead of as file attachments
- **Added auto-URL fixing** - Automatically adds "https://" to URLs without protocol
- **Improved error messages** - Clear, formatted explanations for all errors
- **Made error messages ephemeral** - Only visible to the user who triggered them
- **Fixed button emoji errors** - Removed emoji field from buttons, using descriptive text labels only (↑ Up, ↓ Down, ← Left, → Right)
- **Added /ping command** - Health check with bot latency, uptime, and browser status
  
## Replit-Specific Adaptations
- Uses system Chromium instead of bundled Chrome (via nix package)
- Dynamic executable path detection to handle Nix store updates
- Added `--no-sandbox` and `--disable-setuid-sandbox` flags for Replit environment
