import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { logger } from '../core/logger';
import { MessageSource } from '../shared/types';
import { ingestMessage } from '../core/ingest';
import { config } from '../config/env'; 
import fs from 'fs';
import path from 'path';

export class WhatsAppConnector {
    private client: Client;
    private isReady: boolean = false;
    private lastQR: string = "";
    private authPath = './.wwebjs_auth';

    constructor() {
        this.client = this.createClient();
        this.setupEvents();
    }

    private createClient() {
        return new Client({
            authStrategy: new LocalAuth({
                clientId: config.whatsapp.sessionId,
                dataPath: this.authPath
            }),
            puppeteer: {
                headless: true,
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
            }
        });
    }

    private setupEvents() {
        this.client.on('qr', (qr) => {
            this.lastQR = qr;
            this.isReady = false;
            logger.info('--- NEW QR GENERATED ---');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            this.isReady = true;
            this.lastQR = "";
            logger.info('✅ WhatsApp READY!');
        });

        this.client.on('authenticated', () => logger.info('WhatsApp Authenticated!'));
        
        this.client.on('auth_failure', () => {
            this.isReady = false;
            logger.error('WhatsApp Auth Failure. Clearing session...');
            this.hardReset(); // Auto-reset on failure
        });

        this.client.on('disconnected', () => {
            this.isReady = false;
            logger.warn('WhatsApp Disconnected');
            this.initialize(); // Try to reconnect
        });

        this.client.on('message', async (message) => {
            if (message.from.endsWith('@g.us')) return; 
            await ingestMessage({
                id: message.id.id, 
                source: MessageSource.WHATSAPP,
                sender: message.from,
                content: message.body,
                timestamp: message.timestamp * 1000,
                processed: false
            });
        });
    }

    public initialize() {
        logger.info('Launching WhatsApp...');
        this.client.initialize().catch(err => logger.error('Init Error:', err));
    }

    // New: Force reset session
    public async hardReset() {
        logger.warn('Performing Hard Reset of WhatsApp Client...');
        try {
            await this.client.destroy();
        } catch (e) {}

        // Delete session files
        try {
            const sessionDir = path.resolve(this.authPath);
            if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
                logger.info('Session files deleted.');
            }
        } catch (e) {
            logger.error('Failed to delete session files:', e);
        }

        // Re-create and start
        this.client = this.createClient();
        this.setupEvents();
        this.initialize();
    }

    public isClientReady(): boolean { return this.isReady; }
    public getQR(): string { return this.lastQR; }
    public getClient() { return this.client; }

    public async sendMessage(to: string, content: string) {
        if (!this.isReady) throw new Error('WhatsApp client is not connected.');
        
        try {
            let chatId = to;
            if (!chatId.includes('@c.us') && !chatId.includes('@g.us')) {
                chatId = chatId.replace(/[^0-9]/g, '') + '@c.us';
            }
            await this.client.sendMessage(chatId, content);
            logger.info(`Message sent to ${chatId}`);
        } catch (error: any) {
            logger.error(`WhatsApp Send Error: ${error.message}`);
            throw error;
        }
    }
}