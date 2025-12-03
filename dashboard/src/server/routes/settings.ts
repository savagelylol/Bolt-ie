import { Router } from 'express';
import { ensureAuthenticated } from '../middleware/discordAuth';
import { checkGuildAdmin } from '../utils/permissions';
import settingsService from '../services/settingsService';
import db from '../db/knex';

const router = Router();

router.use(ensureAuthenticated);

router.get('/:guildId', checkGuildAdmin, async (req, res) => {
  try {
    const { guildId } = req.params;
    const settings = await settingsService.getGuildSettings(guildId);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.patch('/:guildId', checkGuildAdmin, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { settings } = req.body;
    const user = req.user as any;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings format' });
    }

    const oldSettings = await settingsService.getGuildSettings(guildId);

    await settingsService.updateMultipleSettings(guildId, settings, user.id);

    await db('audit_logs').insert({
      guild_id: guildId,
      user_id: user.id,
      action: 'SETTINGS_UPDATE',
      changes: JSON.stringify({
        old: oldSettings,
        new: settings
      }),
      ip_address: req.ip
    });

    const updatedSettings = await settingsService.getGuildSettings(guildId);
    
    res.json(updatedSettings);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    res.status(400).json({ error: error.message || 'Failed to update settings' });
  }
});

router.put('/:guildId/:settingKey', checkGuildAdmin, async (req, res) => {
  try {
    const { guildId, settingKey } = req.params;
    const { value } = req.body;
    const user = req.user as any;

    await settingsService.updateGuildSetting(guildId, settingKey, value, user.id);

    await db('audit_logs').insert({
      guild_id: guildId,
      user_id: user.id,
      action: 'SETTING_UPDATE',
      changes: JSON.stringify({
        key: settingKey,
        value: value
      }),
      ip_address: req.ip
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating setting:', error);
    res.status(400).json({ error: error.message || 'Failed to update setting' });
  }
});

router.delete('/:guildId', checkGuildAdmin, async (req, res) => {
  try {
    const { guildId } = req.params;
    const user = req.user as any;

    await settingsService.resetGuildSettings(guildId, user.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

export default router;
