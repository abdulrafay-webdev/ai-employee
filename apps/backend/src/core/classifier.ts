import { Classification, Message } from '@personal-ai/shared';

const CLIENT_KEYWORDS = ['hours', 'price', 'services', 'contact', 'help', 'timing', 'available', 'schedule', 'appointment', 'cost'];
const IMPORTANT_KEYWORDS = ['urgent', 'emergency', 'asap', 'critical', 'payment', 'order', 'problem', 'issue'];

export class Classifier {
    static classify(message: Message): Classification {
        const content = message.content.toLowerCase();

        if (CLIENT_KEYWORDS.some(keyword => content.includes(keyword))) {
            return Classification.CLIENT_QUERY;
        }

        if (IMPORTANT_KEYWORDS.some(keyword => content.includes(keyword))) {
            return Classification.IMPORTANT;
        }

        // Basic spam filter
        if (content.includes('http') || content.includes('www.')) {
            return Classification.UNIMPORTANT;
        }
        
        return Classification.UNKNOWN;
    }
}