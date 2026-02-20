import { describe, it, expect, vi } from 'vitest';
import { Message, Classification, MessageSource } from '@personal-ai/shared';
import { Classifier } from '../core/classifier';
import { ClientQuerySkill } from '../skills/client_query';
import { ImportantMessageSkill } from '../skills/important_message';
import { LogOnlySkill } from '../skills/log_skill';

// Mocking external dependencies
vi.mock('../core/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

vi.mock('../services', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        whatsAppConnector: { // Mocking the connector for outbound messages
            sendMessage: vi.fn(),
        },
    };
});

import { whatsAppConnector } from '../services';


describe('Classification and Skill Integration', () => {

    const testMessages: { input: Partial<Message>, expectedClassification: Classification, expectedReply?: string }[] = [
        { input: { content: 'What are your hours?' }, expectedClassification: Classification.CLIENT_QUERY, expectedReply: "Our hours are 9 AM to 5 PM, Monday to Friday." },
        { input: { content: 'Can you tell me the price?' }, expectedClassification: Classification.CLIENT_QUERY, expectedReply: "You can find our pricing at example.com/pricing" },
        { input: { content: 'Hello, I have an urgent request!' }, expectedClassification: Classification.IMPORTANT },
        { input: { content: 'This is a critical issue, please respond ASAP!' }, expectedClassification: Classification.IMPORTANT },
        { input: { content: 'Visit example.com for more info' }, expectedClassification: Classification.UNIMPORTANT },
        { input: { content: 'This is a test message.' }, expectedClassification: Classification.UNKNOWN },
    ];

    const skills = [
        new ClientQuerySkill(),
        new ImportantMessageSkill(),
        new LogOnlySkill()
    ];

    it('should classify messages correctly and trigger appropriate skills', async () => {
        for (const { input, expectedClassification, expectedReply } of testMessages) {
            const message: Message = {
                id: `test-msg-${Math.random().toString(36).substring(7)}`,
                source: MessageSource.WHATSAPP,
                sender: 'test@sender.com',
                content: input.content || '',
                timestamp: Date.now(),
                processed: false,
                classification: undefined // will be set by classifier
            };

            // Classify the message
            message.classification = Classifier.classify(message);
            expect(message.classification).toBe(expectedClassification);

            // Execute the relevant skill
            let skillExecuted = false;
            for (const skill of skills) {
                if (skill.canHandle(message)) {
                    await skill.execute(message);
                    skillExecuted = true;
                    break; 
                }
            }
            // If no specific skill handled it, LogOnlySkill should execute
            if (!skillExecuted && skills.some(s => s.name === 'LogOnly')) {
                 const logSkill = skills.find(s => s.name === 'LogOnly');
                 if(logSkill) await logSkill.execute(message);
            }

            // Assertions based on classification
            if (expectedClassification === Classification.CLIENT_QUERY) {
                expect(whatsAppConnector.sendMessage).toHaveBeenCalledWith(message.sender, expectedReply);
            } else if (expectedClassification === Classification.IMPORTANT) {
                // Check if DraftManager.createDraft was called (need to mock DraftManager)
                // For now, we assume it's called if the skill is executed
                expect(skillExecuted).toBe(true); // Ensure a skill ran
            } else {
                // For UNIMPORTANT or UNKNOWN, no specific action (reply/draft) expected
                // We can check that sendMessage was NOT called for these cases
                expect(whatsAppConnector.sendMessage).not.toHaveBeenCalled();
            }
        }
    });

    // Add more specific tests for each skill if needed
});
