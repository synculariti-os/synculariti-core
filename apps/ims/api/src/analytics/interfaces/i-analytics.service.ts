export const ANALYTICS_SERVICE_TOKEN = Symbol('ANALYTICS_SERVICE_TOKEN');

export interface WaterfallStep {
  label: string;
  valueEur: number;
  valueKg: number;
  unit: string;
  isSubtotal?: boolean;
  isActual?: boolean;
  isVariance?: boolean;
  isLoss?: boolean;
}

export interface WaterfallResult {
  steps: WaterfallStep[];
  totalBought: number;
  totalSold: number;
  totalLost: number;
  totalVariance: number;
  mode: 'kg' | 'eur';
}

export interface TunnelCategory {
  name: string;
  categoryId: string;
  valueEur: number;
  valueKg: number;
  itemCount: number;
}

export interface IAnalyticsService {
  getWaterfall(tenantId: string, mode: 'kg' | 'eur'): Promise<WaterfallResult>;
  getTunnelCategories(tenantId: string, mode: 'kg' | 'eur'): Promise<TunnelCategory[]>;
  getTunnelItems(categoryId: string, mode: 'kg' | 'eur'): Promise<any>;
  getTunnelItemDetail(itemId: string): Promise<any>;
}
