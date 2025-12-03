import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import dotenv from 'dotenv';
import db from '../db/knex';

dotenv.config();

export interface AuthenticatedUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
  accessToken: string;
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}

passport.serializeUser((user: any, done) => {
  done(null, JSON.stringify(user));
});

passport.deserializeUser(async (serialized: string, done) => {
  try {
    const user = JSON.parse(serialized);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      callbackURL: process.env.DISCORD_CALLBACK_URL || '',
      scope: ['identify', 'email', 'guilds']
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const userData = {
          id: profile.id,
          username: profile.username,
          discriminator: profile.discriminator,
          avatar: profile.avatar,
          email: profile.email,
          last_login: new Date(),
          updated_at: new Date()
        };

        await db('discord_users')
          .insert({
            ...userData,
            created_at: new Date()
          })
          .onConflict('id')
          .merge(userData);

        const user = {
          ...userData,
          accessToken
        };

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

export default passport;
