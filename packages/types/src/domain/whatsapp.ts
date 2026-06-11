export type WhatsAppMessageType = 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'TEMPLATE';
export type WhatsAppOutboxStatus = 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED' | 'COMPLETED';
export type WhatsAppDirection = 'INBOUND' | 'OUTBOUND';
export type WhatsAppInboxStatus = 'RECEIVED' | 'PROCESSED' | 'FAILED';

export const WHATSAPP_MESSAGE_TYPES: WhatsAppMessageType[] = ['TEXT', 'IMAGE', 'DOCUMENT', 'TEMPLATE'];
export const WHATSAPP_OUTBOX_STATUSES: WhatsAppOutboxStatus[] = ['PENDING', 'PROCESSING', 'SENT', 'FAILED', 'COMPLETED'];
