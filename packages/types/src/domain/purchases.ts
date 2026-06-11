export type ReceiptType = 'scanned' | 'ekasa' | 'manual' | 'imported';
export type QuarantineStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_RELEASED';
export type AnomalySeverity = 'low' | 'medium' | 'high';
export type AnomalyStatus = 'OPEN' | 'DISMISSED' | 'ESCALATED';

export const RECEIPT_TYPES: ReceiptType[] = ['scanned', 'ekasa', 'manual', 'imported'];
export const QUARANTINE_STATUSES: QuarantineStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'AUTO_RELEASED'];
