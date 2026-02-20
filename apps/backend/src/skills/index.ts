import { Message } from '@personal-ai/shared';
import { logger } from '../core/logger';
import { DraftManager } from '../core/draft_manager';
import { ClientQuerySkill } from './client_query';
import { ImportantMessageSkill } from './important_message';
import { LogOnlySkill } from './log_skill';
import { whatsAppConnector } from '../services';
import { GmailConnector } from '../connectors/gmail';

// Register skills
const skills = [
    new ClientQuerySkill(),
    new ImportantMessageSkill(),
    new LogOnlySkill() 
];

export { skills };
