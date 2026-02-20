import { google } from 'googleapis';
import { config } from '../config/env';
import { logger } from '../core/logger';
import { Message, MessageSource } from '../shared/types';
import { ingestMessage } from '../core/ingest';

export class GmailConnector {
    private gmail;
    private isAuthenticated: boolean = false;

    constructor() {
        const OAuth2Client = google.auth.OAuth2;
        const oauth2Client = new OAuth2Client(config.gmail.clientId, config.gmail.clientSecret, 'postmessage');
        oauth2Client.setCredentials({ refresh_token: config.gmail.refreshToken });
        this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    }

    public async authenticate() {
        try {
            // Attempt to get a new access token to verify the refresh token works
            const auth = this.gmail.context._options.auth as any;
            await auth.getAccessToken();
            this.isAuthenticated = true;
            logger.info('✅ Gmail verified.');
        } catch (error: any) {
            this.isAuthenticated = false;
            logger.error(`❌ Gmail Auth Failed: ${error.message}`);
            throw error;
        }
    }

    public isReady(): boolean {
        return this.isAuthenticated;
    }

    public async fetchAndIngestEmails() {
        if (!this.isAuthenticated) return;
        
        logger.info('Checking Gmail for new messages...');
        try {
            const query = "label:INBOX -category:{promotions social} is:unread";
            const res = await this.gmail.users.messages.list({ userId: 'me', q: query, maxResults: 10 });
            const messages = res.data.messages;

            if (!messages || messages.length === 0) {
                logger.info('No new important emails found.');
                return;
            }

            for (const message of messages) {
                const email = await this.getEmailById(message.id!);
                if (email) {
                    logger.info(`📩 Ingesting Email from ${email.from}: ${email.subject}`);
                    await ingestMessage({
                        id: email.id,
                        source: MessageSource.GMAIL,
                        sender: email.from,
                        content: `Subject: ${email.subject}\n\nBody: ${email.body}`,
                        timestamp: email.timestamp,
                        processed: false
                    });
                    await this.gmail.users.messages.batchModify({
                        userId: 'me',
                        ids: [email.id],
                        addLabelIds: [],
                        removeLabelIds: ['UNREAD']
                    });
                }
            }
        } catch (error: any) {
            logger.error(`Gmail Fetch Error: ${error.message}`);
        }
    }

    private async getEmailById(messageId: string) {
        try {
            const res = await this.gmail.users.messages.get({ userId: 'me', id: messageId });
            const msg = res.data;
            const headers = msg.payload?.headers;
            const subject = headers?.find(h => h.name === 'Subject')?.value || 'No Subject';
            const from = headers?.find(h => h.name === 'From')?.value || 'Unknown';
            let body = '';
            if (msg.payload?.parts) {
                const textPart = msg.payload.parts.find(p => p.mimeType === 'text/plain');
                if (textPart && textPart.body?.data) {
                    body = Buffer.from(textPart.body.data, 'base64').toString();
                } else if (msg.payload.parts[0].body?.data) {
                    body = Buffer.from(msg.payload.parts[0].body.data, 'base64').toString();
                }
            } else if (msg.payload?.body?.data) {
                body = Buffer.from(msg.payload.body.data, 'base64').toString();
            }
            return { id: msg.id!, subject, from, body, timestamp: parseInt(msg.internalDate || '0') };
        } catch (e) { return null; }
    }
}