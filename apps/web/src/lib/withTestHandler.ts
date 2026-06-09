import { withAuth } from '@/lib/withAuth';
import type { SecureHandler } from '@/lib/types/api';

export function withTestHandler(handler: SecureHandler) {
  console.log('[withTestHandler] NODE_ENV:', process.env.NODE_ENV);
  return process.env.NODE_ENV === 'test' ? handler : withAuth(handler);
}
