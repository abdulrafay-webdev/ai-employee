import express, { Request, Response } from 'express';
import { StorageService } from '../core/storage';
import { DraftManager } from '../core/draft_manager';
import { whatsAppConnector } from '../services';
import { AIService } from '../core/ai';
import { prisma } from '../core/db';

const router = express.Router();

// 1. BUSY REASON API
router.get('/config/reason', async (req, res) => {
    const config = await prisma.config.findUnique({ where: { key: 'busy_reason' } });
    res.json({ reason: config?.value || "important client projects" });
});

router.post('/config/reason', async (req, res) => {
    const { reason } = req.body;
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

// ... Baki routes same ...
router.get('/chats', (req, res) => res.json(StorageService.getActiveChats()));
router.get('/drafts', (req, res) => res.json(DraftManager.getDrafts()));
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
router.get('/status', (req, res) => res.json({ whatsapp: { connected: whatsAppConnector.isClientReady() }, gmail: true }));
router.get('/auth/qr', (req, res) => res.json({ qr: whatsAppConnector.getQR(), connected: whatsAppConnector.isClientReady() }));
router.post('/drafts/:id/send', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const draft = DraftManager.getDrafts().find(d => d.id === id);
    if (!draft) return res.status(404).send("Not found");
    try {
        await whatsAppConnector.sendMessage(draft.sender, content || draft.suggestedReply || draft.content);
        StorageService.logMessage(draft.sender, { role: 'assistant', content: content || draft.suggestedReply || draft.content, type: 'manual', timestamp: Date.now() });
        DraftManager.removeDraft(id);
        res.json({ success: true });
    } catch (e) { res.status(500).send("Failed"); }
});

export default router;