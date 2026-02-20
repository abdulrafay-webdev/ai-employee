export enum MessageSource {
    WHATSAPP = 'whatsapp',
    GMAIL = 'gmail'
}

export enum Classification {
    CLIENT_QUERY = 'client_query',
    IMPORTANT = 'important',
    UNIMPORTANT = 'unimportant',
    UNKNOWN = 'unknown'
}

export interface Message {
    id: string;
    source: MessageSource;
    sender: string;
    content: string;
    timestamp: number;
    classification?: Classification;
    processed: boolean;
    suggestedReply?: string; // New field added
}