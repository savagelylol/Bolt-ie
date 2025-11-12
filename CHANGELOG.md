# Changelog

## 2025-11-04 - v2.0.0 - Cleaner Interface Update

### Changed
- 🎨 **Cleaner button layout** - Reduced from 20 to 16 buttons for a much cleaner interface
- 🎨 **Better organization** - Buttons now organized in logical groups (3-4-5-4 layout)
- 🎨 **Added version footer** - All embeds now show the bot version
- 🎨 **Improved button labels** - Added emoji to Type, Enter, Click, and Reset buttons for clarity
- 🔄 **Removed clutter** - Removed x10, x75, Tab, and Clear buttons (less commonly used)
- 🎨 **Better visual consistency** - Changed embed color to cyan blue (#00BFFF) throughout
- 📝 **Version management** - Added BOT_VERSION constant at top of index.js for easy updates

### New Button Layout
- **Row 1:** x25, x50, x100 (Mouse sensitivity)
- **Row 2:** Back, Forward, Reset, History (Navigation)  
- **Row 3:** Left, Up, Click, Down, Right (Movement)
- **Row 4:** Type, Enter, Scroll Up, Scroll Down (Actions)

## 2025-11-04 - Major Feature Overhaul

### Added
- ✨ **NEW: /presets command** - Quick access to 10 popular websites:
  - 🔍 Google
  - ▶️ YouTube
  - 🐙 GitHub
  - 🐦 Twitter
  - 📰 Reddit
  - 📚 Wikipedia
  - 💬 Discord
  - 📦 Stack Overflow
  - 🛒 Amazon
  - 🎮 Twitch
- 📜 **Scroll functionality** - New scroll up/down buttons for easier page navigation (500px per click)
- ◀️▶️ **Navigation buttons** - Back and Forward buttons using browser history
- 📚 **History tracking** - View last 10 URLs visited in current session
- 🎨 **Improved button layout** - Reorganized controls for better UX with 4 rows of buttons
- 🔄 **History management** - Automatic history clearing on session reset

### Fixed
- 🐛 **CRITICAL: Fixed typing feature** - Changed `interaction.createMessage()` to `bot.createMessage(interaction.channel.id, ...)` 
  - This was causing the Type button to fail silently
  - Users can now type text into web pages again
- 📝 Enhanced type mode with better user feedback message

### Changed
- 🎨 Reorganized button layout from 3 rows to 4 rows for better organization
- 🎯 Moved buttons to more logical positions based on function
- 📊 Increased button ID array from 15 to 20 to accommodate new features
- 🔄 Reset button style changed to danger (red) for better visibility

### Documentation
- 📚 Updated README with comprehensive features list
- 📝 Added detailed command documentation
- 🎮 Added complete button control reference
- 📖 Updated CHANGELOG with all new features

## 2025-11-03 - Replit Environment Setup

### Added
- ✨ Beautiful colorful console logging with emojis using chalk
- 📝 Comprehensive logging for all bot activities:
  - Bot startup and initialization
  - Discord connection status
  - Slash command registration
  - User interactions (browse commands, button clicks)
  - Mouse movements and keyboard input
  - Browser session management
  - Content filtering events
  - Error messages with context
- 📚 Setup documentation (SETUP.md)
- 📚 Project documentation (replit.md)
- 🔧 Dynamic Chromium path detection

### Fixed
- 🐛 Fixed URL validation regex that was causing false "Please provide a valid URL" errors
  - Changed from `/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test()`
  - To `/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test()`
  - Removed double slash in character class and added anchors for exact matching

### Changed
- 🔧 Configured Puppeteer to use system Chromium instead of bundled Chrome
- 🔧 Added `--no-sandbox` and `--disable-setuid-sandbox` flags for Replit environment
- 📦 Installed chalk@4 for CommonJS compatibility

### Environment Setup
- Installed system dependency: chromium
- Created workflow: discordmium-bot
- Environment variables: DISCORD_TOKEN, GUILD_ID
