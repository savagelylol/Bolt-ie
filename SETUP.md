# Discordmium Bot Setup Guide

## Current Status
✅ Bot is configured and ready to run
⚠️ **Action Required**: Bot needs proper permissions to create slash commands

## What Happened
The bot successfully connected to Discord, but encountered a "Missing Access" error when trying to register slash commands. This is because the bot was invited without the `applications.commands` scope.

## How to Fix

### Option 1: Re-invite the Bot (Recommended)
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot application
3. Go to **OAuth2 > URL Generator**
4. Select these scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
5. Select these bot permissions:
   - ✅ Send Messages
   - ✅ Attach Files
   - ✅ Read Messages/View Channels
   - ✅ Use Slash Commands
6. Copy the generated URL
7. Open the URL in your browser and re-invite the bot to your server
8. After re-inviting, restart the workflow in Replit

### Option 2: Manually Add Permissions
1. In your Discord server, go to Server Settings > Integrations
2. Find your bot and click "Manage"
3. Ensure it has the necessary permissions
4. Restart the workflow in Replit

## How to Use the Bot

Once the bot is properly invited:
1. In your Discord server, type `/browse` to start
2. You can optionally provide a URL: `/browse url:https://example.com`
3. Control the browser using the buttons that appear:
   - **Mouse sensitivity**: Adjust with x10, x25, x50, x75, x100 buttons
   - **Navigation**: Arrow buttons to move the cursor
   - **Interaction**: Click, type, enter, tab, and reset buttons
4. Each session lasts 5 minutes by default

## Need Help?
- Make sure "Message Content Intent" is enabled in Discord Developer Portal > Bot settings
- Ensure the bot has been invited with both `bot` AND `applications.commands` scopes
- Check that the DISCORD_TOKEN and GUILD_ID environment variables are correct
