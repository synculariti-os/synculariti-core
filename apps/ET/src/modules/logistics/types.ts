export interface InventoryItem {
  id: string | null;
  tenant_id: string;
  category_id: string;
  sku: string | null;
  name: string;
  type: string;
  purchasing_uom: string;
  inventory_uom: string;
  conversion_factor: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryCategory {
  id: string | null;
  tenant_id: string;
  name: string;
  description: string | null;
  sort_order?: number;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  item_type?: string | null;
  category_group?: string | null;
}

export interface PurchaseOrder {
  id: string;
  tenant_id: string;
  location_id: string | null;
  vendor_id: string | null;
  status: 'DRAFT' | 'SUBMITTED' | 'RECEIVED' | 'CANCELLED';
  order_date: string;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface POLineItem {
  id: string;
  po_id: string;
  item_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  created_at: string;
}

export interface CurrentInventory {
  tenant_id: string;
  location_id: string;
  item_id: string;
  stock_level: number;
  last_movement: string;
}
