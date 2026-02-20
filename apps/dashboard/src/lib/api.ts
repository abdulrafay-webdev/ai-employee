import { Message } from '@personal-ai/shared';

const API_BASE_URL = 'http://localhost:3001/api';

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

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
    } else {
        const text = await response.text();
        console.error(`Non-JSON response from ${url}:`, text);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
}

export const fetchStatus = () => apiFetch('/status');
export const fetchDrafts = () => apiFetch('/drafts');
export const fetchChats = () => apiFetch('/chats');
export const fetchBriefing = () => apiFetch('/briefing');
export const sendDraft = (draftId: string, content?: string) => apiFetch(`/drafts/${draftId}/send`, { method: 'POST', body: JSON.stringify({ content }) });
export const markAsRead = (sender: string) => apiFetch(`/drafts/read/${sender}`, { method: 'POST' });
export const fetchQR = () => apiFetch('/auth/qr');

// NEW: Config API
export const fetchBusyReason = () => apiFetch('/config/reason');
export const updateBusyReason = (reason: string) => apiFetch('/config/reason', { method: 'POST', body: JSON.stringify({ reason }) });
