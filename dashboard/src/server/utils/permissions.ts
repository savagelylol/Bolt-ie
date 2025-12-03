import { Request, Response, NextFunction } from 'express';
import discordApi from '../services/discordApi';

export async function checkGuildAdmin(req: Request, res: Response, next: NextFunction) {
  const guildId = req.params.guildId || req.body.guildId;
  const user = req.user as any;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!guildId) {
    return res.status(400).json({ error: 'Guild ID required' });
  }

  try {
    // First, get user's guilds to find permissions for this guild
    const guilds = await discordApi.getUserGuilds(user.accessToken);
    const guild = guilds.find(g => g.id === guildId);
    
    if (!guild) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You do not have access to this server'
      });
    }

    // Check if user is owner (owners always have admin)
    if (guild.owner) {
      return next();
    }

    // Pass the guild permissions (not access token!)
    const isAdmin = await discordApi.isUserAdmin(guildId, user.id, guild.permissions);
    
    if (!isAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You must be an administrator in this server to access this resource'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking admin permissions:', error);
    res.status(500).json({ error: 'Failed to verify permissions' });
  }
}

export function requireGuildAccess(guildId?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const targetGuildId = guildId || req.params.guildId || req.body.guildId;
    const user = req.user as any;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!targetGuildId) {
      return res.status(400).json({ error: 'Guild ID required' });
    }

    try {
      const guilds = await discordApi.getUserGuilds(user.accessToken);
      const hasAccess = guilds.some(g => g.id === targetGuildId);

      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You do not have access to this server'
        });
      }

      next();
    } catch (error) {
      console.error('Error checking guild access:', error);
      res.status(500).json({ error: 'Failed to verify access' });
    }
  };
}
