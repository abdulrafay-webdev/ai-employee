import { Message } from '@personal-ai/shared';

const API_BASE_URL = 'http://localhost:3001/api';

export const fetchStatus = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        return await response.json();
    } catch (error) {
        return { whatsapp: { connected: false }, gmail: { authenticated: false }, worker: { running: false } };
    }
};

export const fetchDrafts = async (): Promise<Message[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/drafts`);
        return await response.json();
    } catch (error) {
        return [];
    }
};

export const sendDraft = async (draftId: string, content?: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/drafts/${draftId}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }), // Send the updated content
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
};