import { Router } from 'express';
import { ensureAuthenticated } from '../middleware/discordAuth';
import discordApi from '../services/discordApi';
import db from '../db/knex';

const router = Router();

router.use(ensureAuthenticated);

router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      console.error('Guild fetch: No user in session');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    console.log('Fetching guilds for user:', req.user.id);
    const guilds = await discordApi.getUserGuilds(req.user.accessToken);
    console.log(`Got ${guilds.length} total guilds from Discord`);

    // Filter to only guilds where user has admin or is owner
    const adminGuilds = guilds.filter(guild => {
      const isOwner = guild.owner === true;
      const hasAdmin = discordApi.hasAdminPermissions(guild.permissions);
      const qualifies = isOwner || hasAdmin;
      console.log(`  - ${guild.name}: owner=${isOwner}, admin=${hasAdmin}, include=${qualifies}`);
      return qualifies;
    });

    console.log(`Filtered to ${adminGuilds.length} admin/owner guilds`);

    // Save to database
    for (const guild of adminGuilds) {
      try {
        await db('guilds')
          .insert({
            id: guild.id,
            name: guild.name,
            icon: guild.icon || null,
            owner_id: req.user.id,
            updated_at: new Date()
          })
          .onConflict('id')
          .merge({
            name: guild.name,
            icon: guild.icon || null,
            updated_at: new Date()
          });
      } catch (dbError) {
        console.error(`Failed to save guild ${guild.id} to DB:`, (dbError as any).message);
      }
    }

    console.log(`Returning ${adminGuilds.length} admin guilds to client`);
    res.json({ guilds: adminGuilds });
  } catch (error) {
    console.error('Error fetching guilds:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch guilds', details: errorMessage });
  }
});

router.get('/:guildId', async (req, res) => {
  try {
    const { guildId } = req.params;
    const user = req.user as any;

    const isAdmin = await discordApi.isUserAdmin(guildId, user.id, user.accessToken);

    if (!isAdmin) {
      return res.status(403).json({ 
        error: 'You must be an administrator in this server' 
      });
    }

    const guild = await discordApi.getGuild(guildId);

    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    res.json(guild);
  } catch (error) {
    console.error('Error fetching guild:', error);
    res.status(500).json({ error: 'Failed to fetch guild' });
  }
});

router.get('/:guildId/bot-present', async (req, res) => {
  try {
    const { guildId } = req.params;
    console.log('🤖 Checking bot presence for guild:', guildId);

    // Check if bot is in the guild using the bot API
    const guild = await discordApi.getGuild(guildId);
    const botPresent = !!guild;
    console.log('🤖 Bot present:', botPresent);

    // Generate invite URL if bot is not present
    let inviteUrl = null;
    if (!botPresent) {
      const clientId = process.env.DISCORD_CLIENT_ID;
      if (clientId) {
        inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=414464724032&scope=bot%20applications.commands&guild_id=${guildId}`;
      }
    }

    res.json({ 
      present: botPresent,
      inviteUrl 
    });
  } catch (error) {
    // If it's a 404 or any error, assume bot is not present
    console.log('🤖 Bot not present in guild (expected if not invited yet)');
    
    const clientId = process.env.DISCORD_CLIENT_ID;
    let inviteUrl = null;
    if (clientId) {
      inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=414464724032&scope=bot%20applications.commands&guild_id=${guildId}`;
    }
    
    res.json({ 
      present: false,
      inviteUrl 
    });
  }
});

export default router;