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

// ... existing routes ...
router.get('/test', (req, res) => res.json({ message: "Router is working" }));
router.get('/config/reason', async (req, res) => { /*...*/ }); 
router.post('/config/reason', async (req, res) => { /*...*/ });
router.get('/briefing', async (req, res) => { /*...*/ });
router.get('/status', (req, res) => {
    res.json({
        whatsapp: { connected: whatsAppConnector.isClientReady() },
        gmail: { authenticated: gmailConnector.isReady() } 
    });
});
router.get('/auth/qr', (req, res) => res.json({ qr: whatsAppConnector.getQR(), connected: whatsAppConnector.isClientReady() }));
router.get('/chats', (req, res) => res.json(StorageService.getActiveChats()));
router.get('/drafts', (req, res) => res.json(DraftManager.getDrafts()));
router.post('/drafts/read/:sender', (req, res) => { /*...*/ });

// 7. MANUAL SEND (FIXED & ROBUST)
router.post('/drafts/manual-send', async (req, res) => {
    const { sender, content } = req.body;
    
    // 1. Validation
    if (!sender || !content) {
        logger.error("Manual Send Failed: Missing sender or content");
        return res.status(400).json({ message: "Sender and content required" });
    }

    logger.info(`Manual Send Request -> To: ${sender}, Content: "${content}"`);

    // 2. Client Readiness Check
    if (!whatsAppConnector.isClientReady()) {
        logger.error("Manual Send Failed: WhatsApp client not ready");
        return res.status(503).json({ message: "WhatsApp client not ready. Please scan QR code." });
    }

    try {
        // 3. Attempt Send
        await whatsAppConnector.sendMessage(sender, content);
        
        // 4. Log Success
        StorageService.logMessage(sender, { 
            role: 'assistant', 
            content, 
            type: 'manual', 
            timestamp: Date.now() 
        });
        
        // 5. Cleanup Drafts
        const senderClean = sender.replace(/[^a-zA-Z0-9]/g, '_');
        const drafts = DraftManager.getDrafts();
        for (let i = drafts.length - 1; i >= 0; i--) {
            if (drafts[i].sender.replace(/[^a-zA-Z0-9]/g, '_') === senderClean) {
                DraftManager.removeDraft(drafts[i].id);
            }
        }

        logger.info(`✅ Manual Send Successful to ${sender}`);
        res.json({ success: true });

    } catch (error: any) {
        logger.error(`❌ Manual Send Failed: ${error.message}`);
        res.status(500).json({ message: error.message || "Internal Server Error during send" });
    }
});

// Keeping old route for compatibility if needed, but manual-send covers it
router.post('/drafts/:id/send', async (req, res) => { /*...*/ });

export default router;
