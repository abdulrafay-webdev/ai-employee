import { Message } from '@personal-ai/shared';
import { logger } from './logger';

const drafts: Message[] = [];
const history: Message[] = [];

export class DraftManager {
    static createDraft(message: Message) {
        logger.info(`Creating draft for message: ${message.id}`);
        drafts.push(message);
        this.addToHistory(message);
    }

    static addToHistory(message: Message) {
        // Keep last 50 messages in memory
        history.unshift(message);
        if (history.length > 50) history.pop();
    }

    static getDrafts(): Message[] {
        return drafts;
    }

    static getHistory(): Message[] {
        return history;
    }

    static removeDraft(id: string) {
        const index = drafts.findIndex(d => d.id === id);
        if (index !== -1) drafts.splice(index, 1);
    }
}