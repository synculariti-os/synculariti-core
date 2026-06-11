export type PosBatchStatus = 'STAGED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type PosStagingFlag = 'PENDING' | 'APPROVED' | 'QUARANTINED';

export const POS_BATCH_STATUSES: PosBatchStatus[] = ['STAGED', 'PROCESSING', 'COMPLETED', 'FAILED'];
export const POS_STAGING_FLAGS: PosStagingFlag[] = ['PENDING', 'APPROVED', 'QUARANTINED'];
