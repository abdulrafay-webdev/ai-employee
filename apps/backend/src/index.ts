import express from 'express';
import { config } from './config/env';
import { logger } from './core/logger';
import { whatsAppConnector } from './services';
import { GmailConnector } from './connectors/gmail';
import authRoutes from './auth'; 
import dashboardRoutes from './api/routes'; 
import cors from 'cors';

const app = express();
const PORT = 3001; // Force 3001
const GMAIL_FETCH_INTERVAL = 5 * 60 * 1000;

app.use(cors()); 
app.use(express.json());

app.get('/', (req, res) => res.send('Backend is alive!'));
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);

const startServer = async () => {
    // Start listening FIRST so dashboard can connect
    app.listen(PORT, () => {
        logger.info(`AI Employee API is now live on http://localhost:${PORT}`);
    });

    // Initialize connectors in background
    logger.info('Initializing services in background...');
    
    // 1. WhatsApp
    whatsAppConnector.initialize();

    // 2. Gmail
    const gmail = new GmailConnector();
    try {
        await gmail.authenticate();
        setInterval(() => gmail.fetchAndIngestEmails(), GMAIL_FETCH_INTERVAL);
        logger.info('Gmail polling started.');
    } catch (e) {
        logger.error('Gmail Auth Failed. Check .env tokens.');
    }
};

startServer().catch(err => logger.error('Fatal Startup Error:', err));

// Graceful exit
process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    process.exit(0);
});
