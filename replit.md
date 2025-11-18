# Overview

Bolt-ie is a Discord bot that brings a Chromium browser instance directly into Discord. Users can browse the web through Discord interactions, with the bot capturing screenshots and providing interactive controls (navigation buttons, mouse movement, clicking, typing). The bot uses Puppeteer to control a headless Chrome browser and presents the browsing experience through Discord's slash commands and button interactions.

**Warning**: This is designed for self-hosting only. Users have full control over a browser running on the host machine, including access to localhost and network information.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Technologies
- **Discord Library**: Eris (v0.17.1) - Lightweight Discord API wrapper
- **Browser Automation**: Puppeteer (v18.0.5) with Chromium
- **Runtime**: Node.js with ES6+ features
- **Code Style**: ESLint configured with strict formatting rules (tabs, single quotes, semicolons)

## Bot Architecture

### Command System
The bot uses Discord slash commands as the primary interface:
- `/browse [url]` - Initiates browser session
- `/presets` - Quick access to popular websites
- `/ping` - Health check and system info
- `/settings` - User preference configuration

### Browser Management
**Browser Adapter Pattern**: `utils/browserAdapter.js` abstracts browser operations using Puppeteer for Chrome/Chromium control. The adapter handles:
- Browser launching with configurable options
- Page creation and management
- Dark mode emulation support
- Browser type detection and routing

**Rationale**: Abstraction layer allows for potential multi-browser support and centralizes browser lifecycle management.

### Interaction System
**Custom Interaction Collector**: `utils/interactionCollector.js` implements an EventEmitter-based collector for Discord button interactions:
- Filters interactions by component type
- Supports max matches and time-based collection limits
- Event-driven pattern for handling user inputs

**Rationale**: Discord.js-style collector pattern adapted for Eris, providing familiar interaction handling patterns.

### User Settings Persistence
**File-based Storage**: `utils/settings.js` manages user preferences using JSON files:
- Settings stored per-user ID in `data/user_settings.json`
- Default settings include browser type, performance mode, dark mode, ad blocking, session timeout, screenshot quality, mouse sensitivity

**Alternatives Considered**: Database storage was not implemented to keep the project lightweight and self-contained.

**Pros**: Simple, no external dependencies, easy to inspect/modify
**Cons**: Not scalable for large user bases, no concurrent write protection

## Browser Control Features

### Interactive Controls
Multi-row button layout provides:
- **Mouse sensitivity adjustment** (x25, x50, x100 multipliers)
- **Navigation controls** (back, forward, reset, history)
- **Directional mouse movement** (4-way directional + click)
- **Scroll functionality** (up/down page scrolling)
- **Text input** support for form filling

### Content Filtering
**Keyword-based Blacklist**: Extensive NSFW and security-related filtering:
- System/security keywords (localhost, file://, chrome://, etc.)
- Adult content domains and keywords
- External blacklist integration via GitHub-hosted word list

**Rationale**: Prevents abuse by blocking access to sensitive local resources and inappropriate content.

### Performance Optimizations
**Plugin System**: `utils/plugin.js` implements ad-blocking via Chrome DevTools Protocol (CDP):
- Network request interception
- Domain-based blocking for major ad networks (Google Ads, Facebook Pixel, Amazon Ads, etc.)
- Analytics tracker blocking

**Rationale**: Improves browsing performance and reduces bandwidth by blocking ads and trackers at the network level.

## Session Management
- Configurable session timeout (default: 300 seconds)
- Auto-close browser option to free resources
- Screenshot update intervals (default: 5 seconds)
- Adjustable screenshot quality (default: 80%)

## Bot Lifecycle
**Entry Point**: `run.js` handles initialization:
- Environment variable validation (DISCORD_TOKEN, GUILD_ID)
- System-installed Chromium detection and configuration
- Bot status/activity customization via environment variables
- Fallback to bundled Chrome if system Chromium not found

# External Dependencies

## Primary Libraries
- **Eris** (v0.17.1) - Discord API client library
- **Puppeteer** (v18.0.5) - Chromium browser automation
- **Playwright** (v1.56.1) - Listed but currently unused (future multi-browser support)
- **Chalk** (v4.1.2) - Terminal output styling

## Browser Requirements
- Chromium/Chrome browser (system-installed preferred, bundled as fallback)
- Executable path auto-detection on Linux systems

## External Services
- **NSFW Word List**: GitHub-hosted blacklist (`LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words`)
- **Discord API**: Real-time interaction handling and webhook delivery

## Environment Variables
Required:
- `DISCORD_TOKEN` - Bot authentication token
- `GUILD_ID` - Target Discord server ID

Optional:
- `BOT_STATUS` - Bot online status (default: "online")
- `BOT_ACTIVITY_TYPE` - Activity type code (default: "3")
- `BOT_ACTIVITY_NAME` - Activity display text
- `PUPPETEER_EXECUTABLE_PATH` - Custom Chrome/Chromium path

## File System
- `data/user_settings.json` - User preference persistence
- Local screenshot generation and Discord upload