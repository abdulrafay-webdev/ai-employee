import fs from 'fs';
import path from 'path';
import { logger } from './logger';

const BASE_LOG_DIR = path.resolve(process.cwd(), '../../ChatLogs');

export class StorageService {
    /**
     * Get the folder path for a specific date (YYYY-MM-DD)
     */
    private static getDateFolder(date: Date = new Date()): string {
        const dateString = date.toISOString().split('T')[0];
        const folderPath = path.join(BASE_LOG_DIR, dateString);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        return folderPath;
    }

    /**
     * Save a message to the client's thread file
     */
    static logMessage(sender: string, entry: { 
        role: 'user' | 'assistant', 
        content: string, 
        type: 'auto' | 'draft' | 'manual',
        timestamp: number 
    }) {
        try {
            const folder = this.getDateFolder();
            // Sanitize filename (remove @c.us etc for safety)
            const fileName = `${sender.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
            const filePath = path.join(folder, fileName);

            let thread = [];
            if (fs.existsSync(filePath)) {
                thread = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            }

            thread.push(entry);
            fs.writeFileSync(filePath, JSON.stringify(thread, null, 2));
        } catch (error) {
            logger.error('Failed to log message to storage:', error);
        }
    }

    /**
     * Cleanup: Keep only today and yesterday's logs
     */
    static performCleanup() {
        logger.info('Starting rolling memory cleanup (48h rule)...');
        try {
            if (!fs.existsSync(BASE_LOG_DIR)) return;

            const folders = fs.readdirSync(BASE_LOG_DIR).sort();
            if (folders.length > 2) {
                // Delete all but the last 2 folders
                const foldersToDelete = folders.slice(0, folders.length - 2);
                for (const folder of foldersToDelete) {
                    const fullPath = path.join(BASE_LOG_DIR, folder);
                    fs.rmSync(fullPath, { recursive: true, force: true });
                    logger.info(`Deleted old log folder: ${folder}`);
                }
            }
        } catch (error) {
            logger.error('Cleanup failed:', error);
        }
    }

    /**
     * Get all active chats from the last 48 hours
     */
    static getActiveChats() {
        const folders = fs.readdirSync(BASE_LOG_DIR).sort().reverse().slice(0, 2);
        const chats: { [sender: string]: any } = {};

        folders.forEach(folder => {
            const folderPath = path.join(BASE_LOG_DIR, folder);
            const files = fs.readdirSync(folderPath);
            files.forEach(file => {
                const senderKey = file.replace('.json', '');
                const data = JSON.parse(fs.readFileSync(path.join(folderPath, file), 'utf-8'));
                if (!chats[senderKey]) {
                    chats[senderKey] = data;
                } else {
                    // Merge data from both days
                    chats[senderKey] = [...data, ...chats[senderKey]];
                }
            });
        });
        return chats;
    }
}
