import express, { Request, Response, NextFunction } from 'express';
import { logger } from '../core/logger';
import { whatsAppConnector, gmailConnector } from '../services';
import { DraftManager } from '../core/draft_manager';
import { MessageSource } from '../shared/types';
import { StorageService } from '../core/storage';
import { prisma } from '../core/db';
import { AIService } from '../core/ai';

interface DashboardRequest extends Request {
    whatsappConnected?: boolean;
    gmailAuthenticated?: boolean;
}

const router = express.Router();

// TEST ROUTE
router.get('/test', (req, res) => res.json({ message: "Router is working" }));

// 1. BUSY REASON API
router.get('/config/reason', async (req, res) => {
    logger.info("GET /api/config/reason hit");
    const config = await prisma.config.findUnique({ where: { key: 'busy_reason' } });
    res.json({ reason: config?.value || "important client projects" });
});

router.post('/config/reason', async (req, res) => {
    const { reason } = req.body;
    logger.info(`POST /api/config/reason hit with: ${reason}`);
    await prisma.config.upsert({
        where: { key: 'busy_reason' },
        update: { value: reason },
        create: { key: 'busy_reason', value: reason }
    });
    res.json({ success: true });
});

// 2. DAILY BRIEFING (DETAILED)
router.get('/briefing', async (req, res) => {
    try {
        const chats = StorageService.getActiveChats();
        const drafts = DraftManager.getDrafts();
        
        const chatContent = Object.keys(chats).map(sender => {
            const history = chats[sender].map(m => `${m.role}: ${m.content}`).join('\n');
            return `[Sender: ${sender}]\n${history}`;
        }).join('\n---\n');

        const prompt = `
        You are Saim, assistant to Abdul Rafay. Provide a DETAILED Daily Briefing in Roman English.
        
        DATA:
        ${chatContent}
        
        TOTAL PENDING DRAFTS: ${drafts.length}
        
        STRUCTURE:
        1. **Overview**: Summary of today's activity.
        2. **Hot Leads**: Clients interested in specific services (Next.js, WordPress, etc).
        3. **Urgent Actions**: List specifically what Rafay needs to approve or respond to.
        4. **Personal Notes**: Summary of any personal/relative messages.
        
        Use Markdown for headings and bullets. Return ONLY JSON: { "briefing": "string" }
        `;

        const briefing = await AIService.generateBriefing(prompt);
        res.json({ briefing });
    } catch (error) {
        res.status(500).json({ briefing: "Error generating detailed report." });
    }
});

// 3. Status API
router.get('/status', (req, res) => {
    res.json({
        whatsapp: { connected: whatsAppConnector.isClientReady() },
        gmail: { authenticated: gmailConnector.isReady() } // Real status
    });
});

// 4. WhatsApp Auth/QR
router.get('/auth/qr', (req, res) => {
    res.json({
        qr: whatsAppConnector.getQR(),
        connected: whatsAppConnector.isClientReady()
    });
});

// 5. Chats & Drafts
router.get('/chats', (req, res) => res.json(StorageService.getActiveChats()));
router.get('/drafts', (req, res) => res.json(DraftManager.getDrafts()));

// 6. Mark as Read
router.post('/drafts/read/:sender', (req, res) => {
    const { sender } = req.params;
    const senderClean = sender.replace(/[^a-zA-Z0-9]/g, '_');
    const drafts = DraftManager.getDrafts();
    for (let i = drafts.length - 1; i >= 0; i--) {
        if (drafts[i].sender.replace(/[^a-zA-Z0-9]/g, '_') === senderClean) {
            DraftManager.removeDraft(drafts[i].id);
        }
    }
    res.json({ success: true });
});

// 7. Send Draft
router.post('/drafts/:id/send', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const draft = DraftManager.getDrafts().find(d => d.id === id);

    if (!draft) return res.status(404).json({ message: 'Draft not found' });

    try {
        if (draft.source === MessageSource.WHATSAPP) {
            await whatsAppConnector.sendMessage(draft.sender, content || draft.suggestedReply || draft.content);
        } else {
            // TODO: Gmail sending logic
            logger.warn('Gmail sending not yet implemented');
            return res.status(501).json({ message: 'Gmail send not implemented' });
        }

        StorageService.logMessage(draft.sender, {
            role: 'assistant',
            content: content || draft.suggestedReply || draft.content,
            type: 'manual',
            timestamp: Date.now()
        });

        DraftManager.removeDraft(id);
        res.json({ success: true });
    } catch (error: any) {
        logger.error(`Send Failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

export default router;
