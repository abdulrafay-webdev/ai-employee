import { Message, MessageSource, Classification } from '@personal-ai/shared';
import { logger } from '../core/logger';
import { processMessage } from './processor'; // Import the new processor
import crypto from 'crypto';

export const ingestMessage = async (rawMessage: Partial<Message>) => {
    const message: Message = {
        id: rawMessage.id || crypto.randomUUID(),
        source: rawMessage.source || MessageSource.WHATSAPP, // Default for now
        sender: rawMessage.sender || 'unknown',
        content: rawMessage.content || '',
        timestamp: rawMessage.timestamp || Date.now(),
        processed: false,
        classification: rawMessage.classification // Allow pre-classification if available
    };

    logger.info(`Ingesting message from ${message.sender} (${message.source}): ${message.content}`);

    // Process directly in memory instead of using Redis queue
    processMessage(message).catch(err => logger.error('Async processing error:', err));
};
