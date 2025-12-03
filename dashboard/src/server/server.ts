import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import passport from './middleware/discordAuth';
import authRoutes from './routes/auth';
import guildsRoutes from './routes/guilds';
import settingsRoutes from './routes/settings';
import adminRoutes from './routes/admin';

dotenv.config();

if (!process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET environment variable is required');
  process.exit(1);
}

if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.DISCORD_TOKEN) {
  console.error('FATAL: Discord credentials (DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_TOKEN) are required');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5000',
  /\.replit\.dev$/,
  /\.repl\.co$/
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const allowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });
    
    if (allowed || !origin) {
      callback(null, origin || true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/', limiter);

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    name: 'dashboard.sid',
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware to restore session from custom header
app.use((req, res, next) => {
  const sessionId = req.headers['x-session-id'] as string;
  if (sessionId && sessionId !== req.sessionID) {
    console.log('Restoring session from header:', sessionId);
    req.sessionID = sessionId;
  }
  next();
});

// Middleware to ensure JSON responses include credentials
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/guilds', guildsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: 'disabled' });
});

app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Dashboard server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
