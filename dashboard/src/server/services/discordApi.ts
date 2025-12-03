import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DISCORD_API_BASE = 'https://discord.com/api/v10';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export class DiscordApiService {
  private botToken: string;

  constructor() {
    this.botToken = process.env.DISCORD_TOKEN || '';
  }

  async getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
    try {
      const response = await axios.get(`${DISCORD_API_BASE}/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user guilds:', error);
      throw new Error('Failed to fetch user guilds');
    }
  }

  async getUser(accessToken: string): Promise<DiscordUser> {
    try {
      const response = await axios.get(`${DISCORD_API_BASE}/users/@me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async getGuildMember(guildId: string, userId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${DISCORD_API_BASE}/guilds/${guildId}/members/${userId}`,
        {
          headers: {
            Authorization: `Bot ${this.botToken}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching guild member:', error);
      return null;
    }
  }

  async getGuild(guildId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${DISCORD_API_BASE}/guilds/${guildId}`,
        {
          headers: {
            Authorization: `Bot ${this.botToken}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching guild:', error);
      return null;
    }
  }

  hasAdminPermissions(permissions?: string | number | null): boolean {
    if (!permissions) return false;
    try {
      const permissionBits = BigInt(permissions.toString());
      const ADMINISTRATOR = BigInt(0x8);
      const MANAGE_GUILD = BigInt(0x20);
      
      return (permissionBits & ADMINISTRATOR) === ADMINISTRATOR ||
             (permissionBits & MANAGE_GUILD) === MANAGE_GUILD;
    } catch (e) {
      console.warn('Failed to parse permissions:', permissions, e);
      return false;
    }
  }

  async isUserAdmin(guildId: string, userId: string, userPermissions?: string): Promise<boolean> {
    // Check from OAuth permissions first
    if (userPermissions && this.hasAdminPermissions(userPermissions)) {
      return true;
    }

    // Fallback: Check via bot API
    const member = await this.getGuildMember(guildId, userId);
    if (!member) return false;

    const guild = await this.getGuild(guildId);
    if (!guild) return false;

    // Owner always has admin
    if (guild.owner_id === userId) return true;

    // Check member permissions
    if (member.permissions && this.hasAdminPermissions(member.permissions)) {
      return true;
    }

    return false;
  }
}

export default new DiscordApiService();
