import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { logger } from '../core/logger';
import { MessageSource } from '../shared/types';
import { ingestMessage } from '../core/ingest';
import { config } from '../config/env'; 

export class WhatsAppConnector {
    private client: Client;
    private isReady: boolean = false;
    private lastQR: string = "";

    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: config.whatsapp.sessionId,
                dataPath: './.wwebjs_auth'
            }),
            puppeteer: {
                headless: true,
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        this.client.on('qr', (qr) => {
            this.lastQR = qr;
            this.isReady = false;
            logger.info('New QR Generated');
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
            logger.error('WhatsApp Auth Failure');
        });

        this.client.on('disconnected', () => {
            this.isReady = false;
            logger.warn('WhatsApp Disconnected');
            this.client.initialize().catch(() => {});
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

    public isClientReady(): boolean { return this.isReady; }
    public getQR(): string { return this.lastQR; }
    public getClient() { return this.client; }

    public async sendMessage(to: string, content: string) {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not connected.');
        }
        
        try {
            // FIX: Ensure 'to' is a valid serialized ID
            let chatId = to;
            if (!chatId.includes('@c.us') && !chatId.includes('@g.us')) {
                // Remove non-numeric chars and append suffix
                chatId = chatId.replace(/[^0-9]/g, '') + '@c.us';
            }

            // Using getChatById to ensure chat exists before sending (safer)
            // Or just direct send if we trust the ID
            await this.client.sendMessage(chatId, content);
            logger.info(`Message sent to ${chatId}`);
        } catch (error: any) {
            logger.error(`WhatsApp Send Error: ${error.message || error}`);
            throw new Error(`Failed to send via WhatsApp: ${error.message || error}`);
        }
    }
}
