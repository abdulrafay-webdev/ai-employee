import { Message, Classification, MessageSource } from '../shared/types';
import { logger } from './logger';
import { AIService } from './ai';
import { DraftManager } from './draft_manager';
import { whatsAppConnector } from '../services';
import { StorageService } from './storage';

export const processMessage = async (message: Message) => {
    logger.info(`🤖 Saim analyzing (${message.source}): ${message.sender}`);

    try {
        const { reply, shouldAutoSend } = await AIService.getResponse(
            message.sender, 
            message.content, 
            message.source as any
        );
        
        if (message.source === MessageSource.GMAIL && reply === "IGNORE") return;

        // Log client message to history
        StorageService.logMessage(message.sender, {
            role: 'user',
            content: message.content,
            type: 'manual',
            timestamp: message.timestamp
        });

        if (shouldAutoSend && message.source === MessageSource.WHATSAPP) {
            // --- CASE 1: FULL AUTO-REPLY (Sales/Work) ---
            await whatsAppConnector.sendMessage(message.sender, reply);
            StorageService.logMessage(message.sender, {
                role: 'assistant',
                content: reply,
                type: 'auto',
                timestamp: Date.now()
            });
            logger.info(`✅ Saim: Auto-replied with GPT response.`);
        } else {
            // --- CASE 2: DRAFT & ACKNOWLEDGE ---
            if (message.source === MessageSource.WHATSAPP) {
                // Use GPT's response as the reply if it's natural, 
                // but for Drafts we want to tell the user we're informing Rafay.
                // Saim AI already knows to do this in 'reply' field based on persona.
                await whatsAppConnector.sendMessage(message.sender, reply);
                
                StorageService.logMessage(message.sender, {
                    role: 'assistant',
                    content: reply,
                    type: 'draft',
                    timestamp: Date.now()
                });
            }

            // Create draft entry for Dashboard
            DraftManager.createDraft({
                ...message,
                suggestedReply: "", // Blank input field for your manual reply
                content: `[CLIENT]: ${message.content}\n\n[SAIM REPLIED]: ${reply}`
            });
            logger.info(`📝 Saim: Replied and created draft.`);
        }
    } catch (error: any) {
        logger.error(`❌ Saim Error:`, error.message);
    }
};