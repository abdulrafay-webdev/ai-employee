import { Message } from '@personal-ai/shared';

// Use environment variable for live, fallback to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Generic fetcher to handle API calls
 */
async function apiFetch(endpoint: string, options?: RequestInit) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        },
    });
    if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
}

export const fetchStatus = async () => {
    try {
        return await apiFetch('/status');
    } catch (error) {
        console.error("Status fetch failed:", error);
        return { whatsapp: { connected: false }, gmail: { authenticated: false } };
    }
};

export const fetchDrafts = async (): Promise<Message[]> => {
    try {
        return await apiFetch('/drafts');
    } catch (error) {
        console.error("Drafts fetch failed:", error);
        return [];
    }
};

export const fetchChats = async () => {
    try {
        return await apiFetch('/chats');
    } catch (error) {
        console.error("Chats fetch failed:", error);
        return {};
    }
};

export const fetchBriefing = async () => {
    try {
        return await apiFetch('/briefing');
    } catch (error) {
        console.error("Briefing fetch failed:", error);
        return { briefing: "Report load nahi ho saki." };
    }
};

export const sendDraft = async (draftId: string, content?: string) => {
    return await apiFetch(`/drafts/${draftId}/send`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });
};

export const markAsRead = async (sender: string) => {
    return await apiFetch(`/drafts/read/${sender}`, {
        method: 'POST',
    });
};

export const fetchQR = async () => {
    return await apiFetch('/auth/qr');
};
