# Chromie Discord Dashboard

An advanced web dashboard for managing your Discord bot with 40+ configurable settings, Discord OAuth authentication, and admin verification.

## Features

- 🔐 **Discord OAuth Login** - Secure authentication with Discord
- 👮 **Admin Verification** - Only server administrators can access settings
- ⚙️ **40+ Settings** - Comprehensive configuration options:
  - General settings (browser, theme, locale)
  - Access control (roles, users, permissions)
  - Moderation (auto-mod, filters, punishments)
  - Browser automation (performance, sessions, features)
  - Logging & alerts (channels, webhooks, notifications)
  - Integrations (security services, AI, plugins)
  - Quality of life (UX, automation, data management)
- 📊 **Dashboard Overview** - Stats and quick actions
- 📋 **Audit Logs** - Complete history of configuration changes
- 🎨 **Modern UI** - Clean, responsive interface inspired by Pogy

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Discord Bot Token
- Discord OAuth2 Application

## Setup Instructions

### 1. Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or use an existing one
3. Note your **Client ID**
4. Go to **OAuth2** → **General**
   - Add redirect URL: `https://your-repl-url.replit.dev/api/auth/callback`
   - Note your **Client Secret**
5. Go to **Bot** section
   - Note your **Bot Token**
   - Enable required intents (Server Members, Message Content if needed)

### 2. Database Setup

1. Create a PostgreSQL database through Replit:
   - Click the "Database" icon in the left sidebar
   - Click "Create Database"
   - Choose PostgreSQL
2. The `DATABASE_URL` environment variable will be automatically set

### 3. Environment Variables

Create a `.env` file in the `dashboard` directory with:

```env
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=https://your-repl-url.replit.dev/api/auth/callback
DISCORD_BOT_TOKEN=your_bot_token
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=random_string_for_sessions
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-repl-url.replit.dev
```

### 4. Installation

```bash
cd dashboard
npm install
```

### 5. Database Migration

```bash
npm run migrate
```

### 6. Development

```bash
npm run dev
```

This starts both the backend server (port 3001) and frontend dev server (port 5000).

### 7. Production

```bash
npm run build
npm start
```

## Project Structure

```
dashboard/
├── src/
│   ├── server/          # Backend Express server
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth & permissions
│   │   ├── services/    # Business logic
│   │   ├── db/          # Database connection
│   │   └── utils/       # Helper functions
│   └── client/          # Frontend application
│       ├── pages/       # Page components
│       ├── components/  # Reusable components
│       └── styles/      # CSS files
├── migrations/          # Database migrations
├── public/             # Static assets
└── dist/               # Build output
```

## Available Settings

### General Settings (7)
- Default Browser, Allow Firefox, Dark Mode, Dashboard Theme, Locale, Time Zone, Command Prefix

### Access Control (8)
- Allowed/Blocked Roles, Trusted Users, Maintenance Mode, Admin Only Commands, Moderator/Viewer Roles, Restricted Channels

### Moderation (11)
- Auto-Moderation Level, NSFW Filter, URL Blacklist, Allowed Domains, Spam Threshold, Bad Word List, Timeout Duration, Strike Decay, Auto-Kick/Ban Thresholds, Log Moderation Actions

### Browser Automation (11)
- Performance Mode, Max Session Duration, Screenshot Quality, Auto-Close Browser, Mouse Sensitivity, Custom Homepage, Persistent Cookies, Allow Downloads, Clipboard Sync, Keyboard Shortcuts, Max Concurrent Sessions

### Logging & Alerts (9)
- Log/Metrics Channels, Alert/Error Webhooks, DM Owner on Flags, Report Browser Switch, Metrics Interval, Session Start/End Notifications

### Integrations (6)
- Google Safe Browsing, VirusTotal Scan, OpenAI Content Filter, Custom Plugins, Plugin Repository

### Quality of Life (5)
- Session Reminders, Auto-Update Plugins, Cache Screenshots, User Presets, Browser History Export

## API Endpoints

### Authentication
- `GET /api/auth/login` - Initiate Discord OAuth
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user

### Guilds
- `GET /api/guilds` - List admin guilds
- `GET /api/guilds/:guildId` - Get guild details

### Settings
- `GET /api/settings/:guildId` - Get guild settings
- `PATCH /api/settings/:guildId` - Update multiple settings
- `PUT /api/settings/:guildId/:settingKey` - Update single setting
- `DELETE /api/settings/:guildId` - Reset all settings

### Admin
- `GET /api/admin/:guildId/audit-logs` - Get audit logs
- `GET /api/admin/:guildId/stats` - Get dashboard stats

## Security Features

- Discord OAuth2 authentication
- Admin permission verification via Discord API
- Session management with secure cookies
- CSRF protection
- Rate limiting
- Input validation and sanitization
- Audit logging for all changes

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: Vite, TypeScript, HTML/CSS
- **Database**: PostgreSQL with Knex.js
- **Authentication**: Passport.js with Discord Strategy
- **Security**: Helmet, CORS, Rate Limiting

## License

ISC
