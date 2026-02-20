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
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process', // Critical for saving RAM
                    '--disable-gpu',
                    '--disable-canvas-aa',
                    '--disable-2d-canvas-clip-aa',
                    '--disable-gl-drawing-for-tests',
                    '--font-render-hinting=none'
                ],
            }
        });

        this.client.on('qr', (qr) => {
            this.lastQR = qr;
            logger.info('New QR Generated');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            this.isReady = true;
            this.lastQR = "";
            logger.info('✅ WhatsApp READY!');
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
        if (!this.isReady) throw new Error('WhatsApp not connected');
        await this.client.sendMessage(to, content);
    }
}