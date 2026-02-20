import { Skill } from './interface';
import { Message, Classification } from '@personal-ai/shared';
import { whatsAppConnector } from '../services';

export class ClientQuerySkill implements Skill {
    name = 'ClientQuery';

    canHandle(message: Message): boolean {
        return message.classification === Classification.CLIENT_QUERY;
    }

    async execute(message: Message): Promise<void> {
        const content = message.content.toLowerCase();
        let reply = "Thanks for your query. We will get back to you soon.";

        if (content.includes('hours') || content.includes('timing')) {
            reply = "Our hours are 9 AM to 5 PM, Monday to Friday.";
        } else if (content.includes('price') || content.includes('cost')) {
            reply = "You can find our current pricing and service list on our website: example.com/pricing";
        } else if (content.includes('available') || content.includes('schedule')) {
            reply = "I'm available for new projects! You can schedule a call at example.com/booking";
        }
        
        await whatsAppConnector.sendMessage(message.sender, reply);
    }
}
