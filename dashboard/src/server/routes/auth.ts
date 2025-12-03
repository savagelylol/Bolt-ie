import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from '../middleware/discordAuth';
import fs from 'fs';
import path from 'path';

const router = Router();
const ACCESS_FILE = path.join(__dirname, '../../../access.txt');
// Use SESSION_SECRET with a consistent fallback - DO NOT use DISCORD_CLIENT_SECRET for JWT
const JWT_SECRET = process.env.SESSION_SECRET || 'secure-jwt-secret-key-change-in-production';

function checkAccess(userId: string, username: string): boolean {
  try {
    if (!fs.existsSync(ACCESS_FILE)) {
      fs.writeFileSync(ACCESS_FILE, '', 'utf-8');
    }
    
    const allowedUsers = fs.readFileSync(ACCESS_FILE, 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    return allowedUsers.includes(userId) || allowedUsers.includes(username);
  } catch (error) {
    console.error('Error reading access file:', error);
    return false;
  }
}

function logWaitlistUser(userId: string, username: string, discriminator: string) {
  const WAITLIST_FILE = path.join(__dirname, '../../../waitlist.txt');
  const entry = `${userId} - ${username}#${discriminator} - ${new Date().toISOString()}\n`;
  
  try {
    fs.appendFileSync(WAITLIST_FILE, entry, 'utf-8');
    console.log('📝 Added to waitlist:', username);
  } catch (error) {
    console.error('Error logging waitlist user:', error);
  }
}

if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  WARNING: SESSION_SECRET not set! Using default. Set SESSION_SECRET environment variable in production!');
}

router.get('/login', passport.authenticate('discord', { 
  scope: ['identify', 'email', 'guilds']
}));

router.get(
  '/callback',
  passport.authenticate('discord', { 
    failureRedirect: '/?auth=failed'
  }),
  (req: Request, res: Response) => {
    console.log('Auth callback - User authenticated:', req.isAuthenticated());
    
    if (!req.user) {
      return res.redirect('/?auth=failed');
    }

    const user = req.user as any;
    
    // Check if user has access
    if (!checkAccess(user.id, user.username)) {
      console.log('🚫 Access denied for:', user.username);
      logWaitlistUser(user.id, user.username, user.discriminator);
      return res.redirect('/?auth=waitlist');
    }

    // Create JWT token with user data
    const token = jwt.sign(
      { user: req.user },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('✅ JWT token created for user:', user.username);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    res.redirect(`${frontendUrl}/?token=${token}`);
  }
);

router.get('/logout', (req: Request, res: Response) => {
  res.json({ success: true });
});

router.get('/user', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('User authenticated:', decoded.user.username);
    res.json(decoded.user);
  } catch (error: any) {
    console.error('JWT verification failed:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.get('/check', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ authenticated: false, user: null });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    res.json({ authenticated: true, user: decoded.user });
  } catch (error) {
    res.json({ authenticated: false, user: null });
  }
});

export default router;
