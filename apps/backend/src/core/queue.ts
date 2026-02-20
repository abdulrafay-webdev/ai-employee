import { Queue, Worker, Job } from 'bullmq';
import { config } from '../config/env';
import { logger } from './logger';
import { Message } from '@personal-ai/shared';
import { Classifier } from './classifier';
import { ClientQuerySkill } from '../skills/client_query'; 
import { ImportantMessageSkill } from '../skills/important_message';
import { LogOnlySkill } from '../skills/log_skill'; 

const queueName = 'incoming-messages';

export const messageQueue = new Queue(queueName, {
    connection: config.redis
});

// Skills registry
const skills = [
    new ClientQuerySkill(),
    new ImportantMessageSkill(),
    new LogOnlySkill() // Keep this for now if needed for general logging
];

export const worker = new Worker(queueName, async (job: Job<Message>) => {
    const message = job.data;
    logger.info(`Worker processing job ${job.id} for message from ${message.sender}`);

    message.classification = Classifier.classify(message);
    logger.info(`Message classified as: ${message.classification}`);

    for (const skill of skills) {
        if (skill.canHandle(message)) {
            logger.info(`Skill ${skill.name} executing...`);
            await skill.execute(message);
        }
    }

}, {
    connection: config.redis,
    autorun: false 
});

export const startWorker = () => {
    worker.run();
    logger.info('Worker started and listening for messages.');
};