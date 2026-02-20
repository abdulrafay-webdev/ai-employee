import { Message } from '@personal-ai/shared';

export interface Skill {
    name: string;
    canHandle(message: Message): boolean;
    execute(message: Message): Promise<void>;
}
