import dotenv from 'dotenv';
import path from 'path';

// Use __dirname to resolve relative to this file's location
// This file is in apps/backend/src/config/env.ts
// .env is in project root: apps/backend/../../.env
const envPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: envPath });

// Debug log to check if key is loaded
const key = process.env.OPENAI_API_KEY;
if (!key) {
    console.error("❌ BACKEND ERROR: OPENAI_API_KEY not found at " + envPath);
} else {
    console.log("✅ API Keys loaded from project root .env");
}

export const config = {
  db: {
    url: process.env.DATABASE_URL || ''
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
