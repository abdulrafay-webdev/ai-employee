import dotenv from 'dotenv';
import path from 'path';

// Resolve .env from project root VERY strictly
const envPath = path.resolve(process.cwd(), '../../.env');
dotenv.config({ path: envPath });

// Debug log to check if key is loaded (only first 5 chars for safety)
const key = process.env.OPENAI_API_KEY;
if (!key) {
    console.error("❌ BACKEND ERROR: OPENAI_API_KEY not found at " + envPath);
} else {
    console.log("✅ OPENAI_API_KEY loaded successfully.");
}

export const config = {
  db: {
    url: process.env.DATABASE_URL || 'file:./dev.db'
  },
  whatsapp: {
    sessionId: process.env.WHATSAPP_SESSION_ID || 'personal-employee'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  },
  gmail: {
    clientId: process.env.GMAIL_CLIENT_ID || '',
    clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
    refreshToken: process.env.GMAIL_REFRESH_TOKEN || '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || ''
  }
};