import express, { Request, Response } from 'express';
import { whatsAppConnector } from '../services';
import { DraftManager } from '../core/draft_manager';

const router = express.Router();

// QR CODE API
router.get('/auth/qr', (req, res) => {
    const qr = whatsAppConnector.getQR();
    const connected = whatsAppConnector.isClientReady();
    res.json({ qr, connected });
});

// STATUS API
router.get('/status', (req, res) => {
    res.json({
        whatsapp: { connected: whatsAppConnector.isClientReady() },
        gmail: { authenticated: true }
    });
});

// DRAFTS API
router.get('/drafts', (req, res) => {
    res.json(DraftManager.getDrafts());
});

export default router;