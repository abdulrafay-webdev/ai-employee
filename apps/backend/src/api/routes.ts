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

router.get('/test', (req, res) => res.json({ message: "Router is working" }));

// 1. Force Reset WhatsApp (NEW)
router.post('/auth/whatsapp/reset', async (req, res) => {
    logger.warn('Manual WhatsApp Reset Triggered via API');
    try {
        await whatsAppConnector.hardReset();
        res.json({ message: "WhatsApp client resetting... QR should appear shortly." });
    } catch (e) {
        res.status(500).json({ message: "Failed to reset client" });
    }
});

router.get('/auth/qr', (req, res) => res.json({ qr: whatsAppConnector.getQR(), connected: whatsAppConnector.isClientReady() }));

// ... Other routes ...
router.get('/config/reason', async (req, res) => {
    const config = await prisma.config.findUnique({ where: { key: 'busy_reason' } });
    res.json({ reason: config?.value || "important client projects" });
});

router.post('/config/reason', async (req, res) => {
    const { reason } = req.body;
    await prisma.config.upsert({ where: { key: 'busy_reason' }, update: { value: reason }, create: { key: 'busy_reason', value: reason } });
    res.json({ success: true });
});

router.get('/briefing', async (req, res) => {
    try {
        const chats = StorageService.getActiveChats();
        const drafts = DraftManager.getDrafts();
        const chatContent = Object.keys(chats).map(sender => `[Sender: ${sender}]\n` + chats[sender].map((m: any) => `${m.role}: ${m.content}`).join('\n')).join('\n---\n');
        const prompt = `You are Saim. Briefing needed.\nDATA:\n${chatContent}\nPENDING DRAFTS: ${drafts.length}\nReturn JSON { "briefing": "string" }`;
        const briefing = await AIService.generateBriefing(prompt);
        res.json({ briefing });
    } catch (error) { res.status(500).json({ briefing: "Error generating report." }); }
});

router.get('/status', (req, res) => {
    res.json({ whatsapp: { connected: whatsAppConnector.isClientReady() }, gmail: { authenticated: gmailConnector.isReady() } });
});

router.get('/chats', (req, res) => res.json(StorageService.getActiveChats()));
router.get('/drafts', (req, res) => res.json(DraftManager.getDrafts()));

router.post('/drafts/read/:sender', (req, res) => {
    const { sender } = req.params;
    const senderClean = sender.replace(/[^a-zA-Z0-9]/g, '_');
    const drafts = DraftManager.getDrafts();
    for (let i = drafts.length - 1; i >= 0; i--) {
        if (drafts[i].sender.replace(/[^a-zA-Z0-9]/g, '_') === senderClean) DraftManager.removeDraft(drafts[i].id);
    }
    res.json({ success: true });
});

router.post('/drafts/manual-send', async (req, res) => {
    const { sender, content } = req.body;
    if (!sender || !content) return res.status(400).json({ message: "Sender and content required" });
    if (!whatsAppConnector.isClientReady()) return res.status(503).json({ message: "WhatsApp not ready" });

    try {
        await whatsAppConnector.sendMessage(sender, content);
        StorageService.logMessage(sender, { role: 'assistant', content, type: 'manual', timestamp: Date.now() });
        
        const senderClean = sender.replace(/[^a-zA-Z0-9]/g, '_');
        const drafts = DraftManager.getDrafts();
        for (let i = drafts.length - 1; i >= 0; i--) {
            if (drafts[i].sender.replace(/[^a-zA-Z0-9]/g, '_') === senderClean) DraftManager.removeDraft(drafts[i].id);
        }
        res.json({ success: true });
    } catch (error: any) {
        logger.error(`Manual Send Failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

// Old route fallback
router.post('/drafts/:id/send', async (req, res) => {
    res.redirect(307, '/api/drafts/manual-send'); 
});

export default router;