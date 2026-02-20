import { Message } from '@personal-ai/shared';
import { fetchStatus, fetchDrafts, sendDraft } from '../lib/api'; // Assuming these API functions exist

export const getSystemStatus = async () => {
    try {
        const status = await fetchStatus();
        return status;
    } catch (error) {
        console.error("Error fetching system status:", error);
        // Return a default error state
        return {
            whatsapp: { connected: false },
            gmail: { authenticated: false },
            worker: { running: false }
        };
    }
};

export const loadDrafts = async (): Promise<Message[]> => {
    try {
        const drafts = await fetchDrafts();
        return drafts;
    } catch (error) {
        console.error("Error loading drafts:", error);
        return [];
    }
};

export const handleSendDraft = async (draftId: string): Promise<boolean> => {
    try {
        await sendDraft(draftId);
        return true;
    } catch (error) {
        console.error(`Error sending draft ${draftId}:`, error);
        return false;
    }
};

// Placeholder for editing logic - actual editing would involve UI state management
export const handleEditDraft = (draft: Message) => {
    console.log("Editing draft:", draft);
    // This would typically involve opening a modal or navigating to an edit view
};
