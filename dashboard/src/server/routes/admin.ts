import { Router } from 'express';
import { ensureAuthenticated } from '../middleware/discordAuth';
import { checkGuildAdmin } from '../utils/permissions';
import db from '../db/knex';

const router = Router();

router.use(ensureAuthenticated);

router.get('/:guildId/audit-logs', checkGuildAdmin, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const logs = await db('audit_logs')
      .where({ guild_id: guildId })
      .orderBy('created_at', 'desc')
      .limit(Number(limit))
      .offset(Number(offset));

    const total = await db('audit_logs')
      .where({ guild_id: guildId })
      .count('* as count')
      .first();

    res.json({
      logs,
      total: total?.count || 0,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

router.get('/:guildId/stats', checkGuildAdmin, async (req, res) => {
  try {
    const { guildId } = req.params;

    const settingsCount = await db('guild_settings')
      .where({ guild_id: guildId })
      .count('* as count')
      .first();

    const recentLogs = await db('audit_logs')
      .where({ guild_id: guildId })
      .where('created_at', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .count('* as count')
      .first();

    const lastUpdate = await db('guild_settings')
      .where({ guild_id: guildId })
      .orderBy('updated_at', 'desc')
      .first();

    res.json({
      customizedSettings: settingsCount?.count || 0,
      recentActivity: recentLogs?.count || 0,
      lastUpdated: lastUpdate?.updated_at || null
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
