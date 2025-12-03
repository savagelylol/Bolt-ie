import db from '../db/knex';
import Joi from 'joi';

// Default settings for a new guild
export const DEFAULT_SETTINGS = {
  // General Settings (6)
  defaultBrowser: 'chrome',
  allowFirefox: true,
  darkMode: true,
  dashboardTheme: 'dark',
  locale: 'en-US',
  timeZone: 'UTC',

  // Access Control Settings (8)
  allowRoleIDs: [],
  blockRoleIDs: [],
  trustedUserIDs: [],
  maintenanceMode: false,
  adminOnlyCommands: false,
  modRoleIDs: [],
  viewerRoleIDs: [],
  restrictedChannelIDs: [],

  // Moderation Settings (11)
  autoModerationLevel: 'medium',
  nsfwFilter: true,
  urlBlacklist: [],
  allowedDomains: [],
  spamThreshold: 5,
  badWordList: [],
  timeoutDuration: 300000,
  strikeDecayDays: 30,
  autoKickThreshold: 5,
  autoBanThreshold: 10,
  logModerationActions: true,

  // Browser Automation Settings (11)
  performanceMode: false,
  maxSessionDuration: 300000,
  screenshotQuality: 80,
  autoCloseBrowser: true,
  mouseSensitivity: 70,
  customHomepage: '',
  persistentCookies: false,
  allowFileDownloads: true,
  enableClipboardSync: false,
  enableKeyboardShortcuts: true,
  maxConcurrentSessions: 3,

  // Logging & Alerts Settings (9)
  logChannelID: '',
  dmOwnerOnFlags: true,
  alertWebhookURL: '',
  errorWebhookURL: '',
  reportOnBrowserSwitch: false,
  metricsInterval: 3600000,
  metricsChannelID: '',
  notifyOnSessionStart: false,
  notifyOnSessionEnd: false,

  // Integration Settings (6)
  enableGoogleSafeBrowsing: false,
  enableVirusTotalScan: false,
  enableOpenAIContentFilter: false,
  enableCustomPlugins: false,
  pluginRepositoryURL: '',
  customPluginList: [],

  // Quality of Life Settings (5)
  sessionReminderInterval: 60000,
  autoUpdatePlugins: true,
  cacheScreenshots: true,
  allowUserPresets: true,
  allowBrowserHistoryExport: false
};

// Validation schemas for each setting
const settingSchemas: { [key: string]: Joi.Schema } = {
  defaultBrowser: Joi.string().valid('chrome', 'firefox'),
  allowFirefox: Joi.boolean(),
  darkMode: Joi.boolean(),
  dashboardTheme: Joi.string().valid('dark', 'light', 'auto'),
  locale: Joi.string(),
  timeZone: Joi.string(),
  
  allowRoleIDs: Joi.array().items(Joi.string()),
  blockRoleIDs: Joi.array().items(Joi.string()),
  trustedUserIDs: Joi.array().items(Joi.string()),
  maintenanceMode: Joi.boolean(),
  adminOnlyCommands: Joi.boolean(),
  modRoleIDs: Joi.array().items(Joi.string()),
  viewerRoleIDs: Joi.array().items(Joi.string()),
  restrictedChannelIDs: Joi.array().items(Joi.string()),

  autoModerationLevel: Joi.string().valid('off', 'low', 'medium', 'high', 'strict'),
  nsfwFilter: Joi.boolean(),
  urlBlacklist: Joi.array().items(Joi.string()),
  allowedDomains: Joi.array().items(Joi.string()),
  spamThreshold: Joi.number().min(1).max(100),
  badWordList: Joi.array().items(Joi.string()),
  timeoutDuration: Joi.number().min(0),
  strikeDecayDays: Joi.number().min(1).max(365),
  autoKickThreshold: Joi.number().min(0),
  autoBanThreshold: Joi.number().min(0),
  logModerationActions: Joi.boolean(),

  performanceMode: Joi.boolean(),
  maxSessionDuration: Joi.number().min(1000).max(3600000),
  screenshotQuality: Joi.number().min(1).max(100),
  autoCloseBrowser: Joi.boolean(),
  mouseSensitivity: Joi.number().min(1).max(100),
  customHomepage: Joi.string().allow(''),
  persistentCookies: Joi.boolean(),
  allowFileDownloads: Joi.boolean(),
  enableClipboardSync: Joi.boolean(),
  enableKeyboardShortcuts: Joi.boolean(),
  maxConcurrentSessions: Joi.number().min(1).max(10),

  logChannelID: Joi.string().allow(''),
  dmOwnerOnFlags: Joi.boolean(),
  alertWebhookURL: Joi.string().uri().allow(''),
  errorWebhookURL: Joi.string().uri().allow(''),
  reportOnBrowserSwitch: Joi.boolean(),
  metricsInterval: Joi.number().min(60000),
  metricsChannelID: Joi.string().allow(''),
  notifyOnSessionStart: Joi.boolean(),
  notifyOnSessionEnd: Joi.boolean(),

  enableGoogleSafeBrowsing: Joi.boolean(),
  enableVirusTotalScan: Joi.boolean(),
  enableOpenAIContentFilter: Joi.boolean(),
  enableCustomPlugins: Joi.boolean(),
  pluginRepositoryURL: Joi.string().uri().allow(''),
  customPluginList: Joi.array().items(Joi.string()),

  sessionReminderInterval: Joi.number().min(10000),
  autoUpdatePlugins: Joi.boolean(),
  cacheScreenshots: Joi.boolean(),
  allowUserPresets: Joi.boolean(),
  allowBrowserHistoryExport: Joi.boolean()
};

export class SettingsService {
  async getGuildSettings(guildId: string): Promise<any> {
    const settings = await db('guild_settings')
      .where({ guild_id: guildId })
      .select('setting_key', 'setting_value');

    const result: any = { ...DEFAULT_SETTINGS };
    
    for (const setting of settings) {
      try {
        result[setting.setting_key] = typeof setting.setting_value === 'string' 
          ? JSON.parse(setting.setting_value)
          : setting.setting_value;
      } catch {
        result[setting.setting_key] = setting.setting_value;
      }
    }

    return result;
  }

  async updateGuildSetting(
    guildId: string,
    settingKey: string,
    settingValue: any,
    userId: string
  ): Promise<void> {
    // Validate setting
    const schema = settingSchemas[settingKey];
    if (!schema) {
      throw new Error(`Unknown setting: ${settingKey}`);
    }

    const { error } = schema.validate(settingValue);
    if (error) {
      throw new Error(`Invalid value for ${settingKey}: ${error.message}`);
    }

    // Upsert setting
    await db('guild_settings')
      .insert({
        guild_id: guildId,
        setting_key: settingKey,
        setting_value: JSON.stringify(settingValue),
        updated_by: userId,
        updated_at: new Date()
      })
      .onConflict(['guild_id', 'setting_key'])
      .merge(['setting_value', 'updated_by', 'updated_at']);
  }

  async updateMultipleSettings(
    guildId: string,
    settings: { [key: string]: any },
    userId: string
  ): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.updateGuildSetting(guildId, key, value, userId);
    }
  }

  async resetGuildSettings(guildId: string, userId: string): Promise<void> {
    await db('guild_settings')
      .where({ guild_id: guildId })
      .delete();

    // Log the reset action
    await db('audit_logs').insert({
      guild_id: guildId,
      user_id: userId,
      action: 'SETTINGS_RESET',
      changes: null
    });
  }

  validateSetting(settingKey: string, settingValue: any): boolean {
    const schema = settingSchemas[settingKey];
    if (!schema) return false;
    
    const { error } = schema.validate(settingValue);
    return !error;
  }
}

export default new SettingsService();
