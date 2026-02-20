import { Skill } from './interface';
import { Message, Classification } from '@personal-ai/shared';
import { logger } from '../core/logger';
import { DraftManager } from '../core/draft_manager';

export class ImportantMessageSkill implements Skill {
    name = 'ImportantMessage';

    canHandle(message: Message): boolean {
        // Handle IMPORTANT or UNKNOWN messages (better to draft than ignore)
        return message.classification === Classification.IMPORTANT || message.classification === Classification.UNKNOWN;
    }

    async execute(message: Message): Promise<void> {
        logger.info(`Handling message from ${message.sender} (Class: ${message.classification}). Creating draft.`);
        DraftManager.createDraft(message); 
    }
}
