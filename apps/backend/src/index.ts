import express from 'express';
import { config } from './config/env';
import { logger } from './core/logger';
import { whatsAppConnector } from './services';
import { GmailConnector } from './connectors/gmail';
import authRoutes from './auth'; 
import dashboardRoutes from './api/routes'; 
import cors from 'cors';

const app = express();
const PORT = 3001; 
const GMAIL_FETCH_INTERVAL = 5 * 60 * 1000;

// OPEN CORS FOR DASHBOARD
app.use(cors({
    origin: '*', // Allow all for now during development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => res.send('Backend is alive!'));
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);

const startServer = async () => {
    app.listen(PORT, '0.0.0.0', () => { // Explicitly listen on all interfaces
        logger.info(`AI Employee API is now live on http://localhost:${PORT}`);
        logger.info(`Routes mounted: /api/auth, /api/status, /api/config/reason`);
    });

    logger.info('Initializing services in background...');
    
    whatsAppConnector.initialize();

    const gmail = new GmailConnector();
    try {
        await gmail.authenticate();
        setInterval(() => gmail.fetchAndIngestEmails(), GMAIL_FETCH_INTERVAL);
        logger.info('Gmail polling started.');
    } catch (e) {
        logger.error('Gmail Auth Failed.');
    }
};

startServer().catch(err => logger.error('Fatal Startup Error:', err));

process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    process.exit(0);
});