// apps/backend/src/services.ts
import { WhatsAppConnector } from './connectors/whatsapp';
import { GmailConnector } from './connectors/gmail'; // Import GmailConnector

// Create singleton instances of services
export const whatsAppConnector = new WhatsAppConnector();
export const gmailConnector = new GmailConnector(); // Export GmailConnector instance