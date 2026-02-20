import { Skill } from '../skills/interface';
import { Message } from '@personal-ai/shared';
import { logger } from '../core/logger';

export class LogOnlySkill implements Skill {
    name = 'LogOnly';

    canHandle(message: Message): boolean {
        // Handle all messages for MVP logging
        return true;
    }

    async execute(message: Message): Promise<void> {
        logger.info(`[LogOnly] Processed message: ${message.content}`);
    }
}
