# Chromie Discord Bot Project

## Overview
This project contains a Discord bot with browser automation capabilities and an advanced web dashboard for managing bot settings.

## Project Structure

### Bot (`/`)
- Main Discord bot using Eris framework
- Browser automation with Puppeteer and Playwright
- User settings stored in `data/user_settings.json`

### Dashboard (`/dashboard/`)
- Modern web dashboard with 57+ configurable settings
- Discord OAuth2 authentication
- Admin-only access verification
- PostgreSQL database for guild settings
- Full audit logging system

## Dashboard Features

The dashboard includes 8 major categories with 57 total settings:

1. **General Settings** (7): Browser preferences, theme, locale, timezone, command prefix
2. **Access Control** (8): Role permissions, trusted users, maintenance mode
3. **Moderation** (11): Auto-moderation, content filters, punishment settings
4. **Browser Automation** (11): Performance, sessions, screenshots, features
5. **Logging & Alerts** (9): Channels, webhooks, notifications
6. **Integrations** (6): Security services, AI filters, custom plugins
7. **Quality of Life** (5): User experience and automation features
8. **Audit Logs**: Complete history of all configuration changes

## Recent Changes (December 4, 2025)

### Performance Optimizations & Bug Fixes
Major performance improvements to significantly speed up bot response times:
- **Instant Keyboard Typing**: Removed 10ms per-character delay for instant text input (previously took 100ms+ for 10 characters)
- **Faster Anti-bot Redirects**: Reduced redirect delays from 500-1500ms to 50-150ms (3-10x faster)
- **Faster Browser Cleanup**: Reduced cleanup delay from 1000ms to 100ms (10x faster)
- **Fixed Mouse Controls**: Corrected boundary logic with proper bounds checking and clamping
- **Fixed Text Input Bug**: Fixed critical bug where data.splice used an object instead of array index
- **Database Connection Reuse**: forceEndMaintenance now reuses existing database connection
- **Memory Leak Prevention**: Added periodic rate limit cleanup every 5 minutes
- **Graceful Shutdown**: Added proper cleanup on SIGTERM/SIGINT to close all browser instances

### Session Management & Stability Fixes (December 3, 2025)
Critical fixes to the bot's session management system:
- **Session Sync Fix**: Added `syncSessionToGlobals()` helper to maintain consistency between per-guild sessions and global variables
- **Initial Session Sync**: Session state now syncs immediately after browser initialization at startup
- **Reset Handler Fixes**: Both Reset button handlers now properly update the guild session object before syncing
- **Timeout/Redirect Fixes**: All resetProcess calls (timeout, redirect block) now properly sync session state
- **Duplicate Commands Fix**: Bot now clears guild-specific commands on startup to prevent duplicate slash commands
- **Vite Security Update**: Updated vite to v7.2.6 to fix moderate severity vulnerability

### iOS 26 Liquid Glass Redesign (December 2, 2025)
Complete visual overhaul implementing a cutting-edge "Liquid Glass" aesthetic inspired by iOS 26:
- **Glass Morphism Effects**: Advanced backdrop filters with blur, translucency, and refractive gradients
- **Animated Aurora Background**: Flowing gradient animations with purple-to-pink color scheme
- **3D Toggle Switches**: Toggle switches with sliding animations and accent glow effects
- **Glass Orb Statistics**: Stat cards with internal glow and gradient backgrounds
- **Activity River**: Real-time log stream with animated bubble icons
- **Liquid Cards**: Glass panels with edge highlights and internal reflections
- **Mobile Responsive**: Mobile navigation toggle with slide-out sidebar
- **Toast Notifications**: Glass-style toast messages with slide-in animations
- **Bot Invite Modal**: Enhanced modal with backdrop blur and funny random messages

### Previous Updates (November 23, 2025)
- **Vercel PostgreSQL Integration**: Connected dashboard to Vercel PostgreSQL database using `POSTGRES_URL` secret
- **Fixed Admin Permissions Bug**: Corrected BigInt conversion error that prevented server owners from accessing settings
- **Improved User Experience**: Added hover effects, focus states, and transition animations throughout the dashboard

### Security Improvements
- **Secured Sensitive Credentials**: Moved `DISCORD_CLIENT_SECRET` and `DISCORD_TOKEN` from environment variables to Replit Secrets
- **Removed Token Logging**: Eliminated console.log statements that exposed JWT tokens and sensitive authentication data
- **Fixed Auth Redirect Loop**: Resolved database migration issue that caused users to be redirected back to login page
- **Database Migrations**: Successfully ran migrations to create required PostgreSQL tables

### Added
- Complete TypeScript + Express dashboard backend
- Vite-powered frontend with modern UI
- Discord OAuth2 authentication system
- PostgreSQL database integration with Knex.js
- 57 configurable settings across 8 categories
- Admin permission verification via Discord API
- Audit logging for all settings changes
- Security features: rate limiting, CSRF protection, input validation
- Responsive design inspired by Pogy's dashboard

### Technical Stack
- **Backend**: Node.js, Express, TypeScript, Passport.js
- **Frontend**: Vite, TypeScript, HTML/CSS (no framework dependencies)
- **Database**: PostgreSQL with Knex.js ORM
- **Authentication**: Discord OAuth2 with session management

## Setup Instructions

### Dashboard Setup

1. **Database**: PostgreSQL database configured via Vercel or Replit
2. **Secrets** (stored securely in Replit Secrets):
   - `DISCORD_CLIENT_SECRET` - Your Discord OAuth2 client secret
   - `DISCORD_TOKEN` - Your Discord bot token
   - `SESSION_SECRET` - Random session secret for JWT signing
   - `POSTGRES_URL` - Your Vercel PostgreSQL connection string (optional, if using Vercel)
3. **Environment Variables**:
   - `DISCORD_CLIENT_ID` - Your Discord application client ID (public)
   - `DISCORD_CALLBACK_URL` - OAuth2 callback URL
   - `FRONTEND_URL` - Your Replit webview URL
4. **Discord OAuth**: Add the callback URL to Discord Developer Portal → OAuth2 → Redirects
5. **Run Migrations**: `cd dashboard && npm run migrate` (already completed)
6. **Access**: The dashboard is available at your Replit webview URL

### Discord Developer Portal Configuration

1. Go to https://discord.com/developers/applications
2. Select your application
3. **OAuth2 → General**: Add redirect URL: `https://your-repl-url.replit.dev/api/auth/callback`
4. **OAuth2 → URL Generator**: Select scopes: `identify`, `email`, `guilds`

## User Preferences

- Modern, clean UI design preferred
- Security-focused with proper authentication
- Comprehensive settings management
- Audit trail for all changes

## Project Architecture

### Dashboard Architecture
```
dashboard/
├── src/
│   ├── server/           # Express backend
│   │   ├── routes/       # Auth, guilds, settings, admin API
│   │   ├── middleware/   # Discord auth, permissions
│   │   ├── services/     # Business logic (settings, Discord API)
│   │   └── db/           # Database connection
│   └── client/           # Frontend application
│       ├── pages/        # Settings pages (8 categories)
│       ├── components/   # Reusable UI components
│       └── styles/       # CSS styling
├── migrations/           # Database schema migrations
└── public/              # Static assets
```

### Key Design Decisions

1. **Secrets Management**: Sensitive credentials (bot token, client secret, session secret) are stored in Replit Secrets, not environment variables
2. **Admin Verification**: Uses Discord API to verify administrator permissions (0x8 or 0x20 flags)
3. **Settings Storage**: Guild-specific settings in PostgreSQL with JSONB for flexibility
4. **Session Management**: JWT-based authentication with 24-hour expiry
5. **Security**: Helmet, CORS, rate limiting, input validation, no token logging

## Next Steps

1. **Create PostgreSQL Database**: Use Replit's Database panel
2. **Run Migrations**: Execute `cd dashboard && npm run migrate` to set up tables
3. **Test Dashboard**: Login with Discord and select a server you administrate
4. **Configure Settings**: Customize the 57+ available bot settings
5. **Integration**: Connect bot code to read settings from the dashboard database

## Notes

- The dashboard requires administrator permissions in a Discord server to access settings
- All configuration changes are logged in the audit logs
- Settings are server-specific (per guild)
- The frontend uses no heavyweight frameworks - just TypeScript + Vite
