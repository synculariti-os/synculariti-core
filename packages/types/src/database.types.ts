// Auto-generated Kysely schema definitions matching the unified Synculariti Core schema
import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import type {
  FranchiseGroupId, RestaurantId, ItemId, CategoryId, UserId, RoleId,
  VendorId, PurchaseOrderId, PoLineItemId, InventoryBatchId, RecipeId, RecipeIngredientId,
  MenuItemMappingId, LedgerEntryId, TransferId, CountBatchId, CountRowId, WasteLogId, PrepLogId,
  SalesImportBatchId, SalesImportRowId, PosRawImportId, SnapshotId, FlagId,
  PurchaseId, TransactionId, InvoiceId, InvoiceItemId, ReceiptItemId,
  WhatsAppInboxId, WhatsAppOutboxId, ApiKeyId, ChartOfAccountId,
  GraphSyncQueueId, OutboxEventId, PosBatchUploadId, PosTransactionStagingId,
  AuditLogId, TenantMemberId, AppUserId, CachedRecipeId, CachedIngredientId,
  PurchaseAnomalyId, PendingFollowupId, PosDataGapId, RateLimitId,
  TelemetryId, FeatureFlagId
} from './branded';
import type { PermissionCode } from './constants/permissions';
import type { ItemType } from './domain/item';
import type { LedgerReasonCode, TransferStatus, CountStatus } from './domain/inventory';
import type { PurchaseOrderStatus } from './domain/procurement';
import type { ImportStatus } from './domain/sales';
import type { FeatureFlagKey } from './domain/settings';
import type { ReceiptType, QuarantineStatus, AnomalySeverity, AnomalyStatus } from './domain/purchases';
import type { TransactionType } from './domain/finance';
import type { WhatsAppMessageType, WhatsAppOutboxStatus, WhatsAppDirection, WhatsAppInboxStatus } from './domain/whatsapp';
import type { PosBatchStatus, PosStagingFlag } from './domain/pos';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  franchise_groups: {
    id: FranchiseGroupId;
    name: string;
    pin: string | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    deleted_at: string | null;
  };
  restaurants: {
    id: RestaurantId;
    franchise_group_id: FranchiseGroupId;
    name: string;
    timezone: string;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    deleted_at: string | null;
  };
  users: {
    id: UserId;
    email: string;
    full_name: string;
    phone_number: string | null;
    active: Generated<boolean>;
    last_login_at: string | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    deleted_at: string | null;
  };
  app_users: {
    id: UserId;
    tenant_id: FranchiseGroupId;
    full_name: string | null;
    created_at: Generated<string | null>;
    updated_at: Generated<string | null>;
  };
  tenant_members: {
    id: TenantMemberId;
    tenant_id: FranchiseGroupId;
    email: string;
    role: Generated<string>;
    invited_at: Generated<string | null>;
    joined_at: string | null;
  };
  roles: {
    id: RoleId;
    name: string;
    description: string | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
  };
  permissions: {
    id: string;
    code: PermissionCode;
    description: string | null;
    created_at: Generated<string>;
  };
  role_permissions: {
    role_id: RoleId;
    permission_id: string;
  };
  user_restaurant_roles: {
    id: string;
    user_id: UserId;
    restaurant_id: RestaurantId;
    role_id: RoleId;
    created_at: Generated<string>;
  };
  item_categories: {
    id: CategoryId;
    tenant_id: FranchiseGroupId;
    name: string;
    description: string | null;
    item_type: string | null;
    category_group: string | null;
    created_at: Generated<string | null>;
    updated_at: Generated<string | null>;
    deleted_at: string | null;
  };
  items: {
    id: ItemId;
    tenant_id: FranchiseGroupId;
    restaurant_id: RestaurantId | null;
    category_id: CategoryId;
    name: string;
    sku: string;
    type: ItemType;
    purchasing_uom: string;
    inventory_uom: string;
    recipe_uom: string | null;
    inv_to_recipe_ratio: Generated<number>;
    barcode: string | null;
    allergen_info: string | null;
    supplier_sku: string | null;
    unit_cost: number | null;
    is_active: Generated<boolean>;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    deleted_at: string | null;
  };
  item_restaurant_overrides: {
    id: string;
    item_id: ItemId;
    restaurant_id: RestaurantId;
    par_level: number;
    is_active: Generated<boolean>;
    created_at: Generated<string>;
    updated_at: Generated<string>;
  };
  uom_conversions: {
    id: string;
    item_id: ItemId;
    from_uom: string;
    to_uom: string;
    multiplier_factor: number;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    deleted_at: string | null;
  };
  vendors: {
    id: VendorId;
    tenant_id: FranchiseGroupId | null;
    restaurant_id: RestaurantId | null;
    name: string;
    contact_email: string | null;
    phone: string | null;
    vendor_code: string | null;
    is_active: Generated<boolean>;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    deleted_at: string | null;
  };
  purchase_orders: {
    id: PurchaseOrderId;
    tenant_id: FranchiseGroupId;
    restaurant_id: RestaurantId;
    vendor_id: VendorId;
    status: PurchaseOrderStatus;
    order_date: Generated<string>;
    expected_delivery_date: string | null;
    delivered_date: string | null;
    freight_charge: Generated<number>;
    tax_amount: Generated<number>;
    discount_amount: Generated<number>;
    total_amount: number | null;
    currency: Generated<string>;
    notes: string | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    deleted_at: string | null;
  };
  po_line_items: {
    id: PoLineItemId;
    po_id: PurchaseOrderId;
    item_id: ItemId;
    quantity_ordered: number;
    quantity_received: Generated<number>;
    unit_price: number;
    created_at: Generated<string>;
  };
  inventory_batches: {
    id: InventoryBatchId;
    restaurant_id: RestaurantId;
    item_id: ItemId;
    po_id: PurchaseOrderId | null;
    received_date: string;
    initial_qty: number;
    remaining_qty: number;
    landed_unit_cost: number;
    created_at: Generated<string>;
    updated_at: Generated<string>;
  };
  recipes: {
    id: RecipeId;
    tenant_id: FranchiseGroupId | null;
    restaurant_id: RestaurantId | null;
    produces_item_id: ItemId | null;
    recipe_name: string;
    yield_quantity: number;
    price_eur: number | null;
    vat_rate: number | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    deleted_at: string | null;
  };
  recipe_ingredients: {
    id: RecipeIngredientId;
    recipe_id: RecipeId;
    ingredient_item_id: ItemId | null;
    sub_recipe_id: RecipeId | null;
    quantity_required: number;
    created_at: Generated<string>;
  };
  menu_item_mappings: {
    id: MenuItemMappingId;
    restaurant_id: RestaurantId;
    raw_excel_string: string;
    recipe_id: RecipeId;
    created_at: Generated<string>;
  };
  cached_recipes: {
    id: CachedRecipeId;
    tenant_id: FranchiseGroupId;
    menu_item_id: string;
    menu_item_name: string;
    ingredients: Json;
    total_ingredient_cost: number | null;
    food_cost_pct: number | null;
    selling_price: number | null;
    is_active: Generated<boolean | null>;
    fetched_at: Generated<string>;
  };
  cached_ingredients: {
    id: CachedIngredientId;
    tenant_id: FranchiseGroupId;
    ingredient_id: string;
    canonical_name: string;
    category: string | null;
    base_unit: string | null;
    cost_per_gram: number | null;
    current_stock_grams: number | null;
    perishability_days: number | null;
    fetched_at: Generated<string>;
  };
  inventory_ledger: {
    id: LedgerEntryId;
    restaurant_id: RestaurantId;
    item_id: ItemId;
    change_amount: number;
    reason_code: LedgerReasonCode;
    reference_id: string | null;
    location_id: RestaurantId | null;
    created_at: Generated<string>;
  };
  inventory_transfers: {
    id: TransferId;
    tenant_id: FranchiseGroupId;
    origin_restaurant_id: RestaurantId;
    destination_restaurant_id: RestaurantId;
    item_id: ItemId;
    qty: number;
    status: TransferStatus;
    created_at: Generated<string>;
    updated_at: Generated<string>;
  };
  inventory_count_batches: {
    id: CountBatchId;
    restaurant_id: RestaurantId;
    status: CountStatus;
    snapshot_timestamp: Generated<string>;
    version: Generated<number>;
    created_at: Generated<string>;
    updated_at: Generated<string>;
  };
  inventory_count_rows: {
    id: CountRowId;
    batch_id: CountBatchId;
    item_id: ItemId;
    expected_qty: number;
    actual_qty: number | null;
    variance_qty: number | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
  };
  waste_logs: {
    id: WasteLogId;
    restaurant_id: RestaurantId;
    item_id: ItemId;
    quantity: number;
    reason: string | null;
    recorded_at: Generated<string>;
    created_at: Generated<string>;
  };
  prep_production_logs: {
    id: PrepLogId;
    restaurant_id: RestaurantId;
    prep_item_id: ItemId;
    yield_qty_produced: number;
    produced_at: Generated<string>;
    created_at: Generated<string>;
  };
  sales_import_batches: {
    id: SalesImportBatchId;
    restaurant_id: RestaurantId;
    business_date: string | null;
    status: ImportStatus;
    error_message: string | null;
    file_url: string | null;
    storage_path: string | null;
    uploaded_by: UserId | null;
    original_file_name: string | null;
    total_rows: number | null;
    imported_rows: number | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
  };
  sales_import_rows: {
    id: SalesImportRowId;
    batch_id: SalesImportBatchId;
    raw_item_name: string;
    quantity_sold: number;
    is_mapped: Generated<boolean>;
    created_at: Generated<string>;
  };
  pos_raw_imports: {
    id: PosRawImportId;
    batch_id: SalesImportBatchId;
    plu: number | null;
    charakteristika_1: string | null;
    charakteristika_2: string | null;
    barcode: string | null;
    nazov: string;
    plu_type_number: number | null;
    plu_type_text: string | null;
    group_number: number | null;
    group_name: string | null;
    outlet_number: number | null;
    outlet_name: string | null;
    quantity: number;
    uom: string | null;
    total_price_excl_vat: number | null;
    total_price_incl_vat: number | null;
    total_cogs: number | null;
    original_price_incl_vat: number | null;
    total_discount: number | null;
    optional_text_1: string | null;
    optional_text_2: string | null;
    optional_text_3: string | null;
    raw_json: Json | null;
    created_at: Generated<string>;
  };
  daily_inventory_snapshots: {
    id: SnapshotId;
    restaurant_id: RestaurantId;
    item_id: ItemId;
    business_date: string;
    eod_qty: Generated<number>;
    fifo_total_value: Generated<number>;
    created_at: Generated<string>;
  };
  mat_view_variance_analytics: {
    restaurant_id: RestaurantId | null;
    item_id: ItemId | null;
    reporting_month: string | null;
    actual_qty: number | null;
    theoretical_qty: number | null;
    unexplained_variance_qty: number | null;
  };
  audit_log: {
    id: AuditLogId;
    tenant_id: FranchiseGroupId | null;
    user_id: UserId | null;
    actor_name: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    old_value: Json | null;
    new_value: Json | null;
    metadata: Json | null;
    success: Generated<boolean>;
    error_message: string | null;
    source_ip: string | null;
    user_agent: string | null;
    restaurant_id: RestaurantId | null;
    created_at: Generated<string>;
  };
  feature_flags: {
    id: FeatureFlagId;
    restaurant_id: RestaurantId;
    flag_key: FeatureFlagKey;
    flag_value: Generated<boolean>;
    created_at: Generated<string>;
    updated_at: Generated<string>;
  };
  purchases: {
    id: PurchaseId;
    tenant_id: FranchiseGroupId;
    location_id: RestaurantId;
    account_id: ChartOfAccountId | null;
    vendor_name: string | null;
    invoice_number: string | null;
    total_amount: number;
    currency: Generated<string>;
    tax_amount: number | null;
    tax_rate: number | null;
    receipt_type: Generated<ReceiptType>;
    receipt_hash: string | null;
    source_image_url: string | null;
    purchase_date: string;
    quarantine_status: Generated<QuarantineStatus>;
    reviewed_at: string | null;
    reviewed_by: UserId | null;
    rejection_reason: string | null;
    rejection_note: string | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
  };
  purchase_anomaly_queue: {
    id: PurchaseAnomalyId;
    tenant_id: FranchiseGroupId;
    location_id: RestaurantId;
    purchase_id: PurchaseId;
    receipt_item_id: ReceiptItemId | null;
    check_type: string;
    severity: AnomalySeverity;
    anomaly_score: number | null;
    anomaly_detail: string | null;
    status: AnomalyStatus;
    outbox_id: WhatsAppOutboxId | null;
    notification_sent_at: string | null;
    response_received_at: string | null;
    response_decision: string | null;
    created_at: Generated<string>;
  };
  pending_text_followups: {
    id: PendingFollowupId;
    tenant_id: FranchiseGroupId;
    outbox_id: WhatsAppOutboxId;
    entity_type: string;
    entity_id: string;
    status: Generated<string>;
    prompt: string;
    response: string | null;
    created_at: Generated<string>;
    responded_at: string | null;
    expires_at: string;
  };
  chart_of_accounts: {
    id: ChartOfAccountId;
    tenant_id: FranchiseGroupId;
    account_code: string;
    account_name: string;
    account_type: string;
    created_at: Generated<string | null>;
  };
  transactions: {
    id: TransactionId;
    tenant_id: FranchiseGroupId;
    location_id: RestaurantId | null;
    who_id: string | null;
    who: string | null;
    category: string | null;
    amount: number;
    currency: Generated<string>;
    date: string;
    description: string | null;
    ico: string | null;
    receipt_number: string | null;
    transacted_at: string | null;
    vat_detail: Json | null;
    transaction_type: Generated<TransactionType>;
    is_deleted: Generated<boolean>;
    created_at: Generated<string | null>;
    updated_at: Generated<string | null>;
  };
  invoices: {
    id: InvoiceId;
    tenant_id: FranchiseGroupId;
    vendor_id: string | null;
    invoice_number: string | null;
    status: Generated<string>;
    total_amount: number | null;
    currency: Generated<string | null>;
    due_date: string | null;
    created_at: Generated<string | null>;
    updated_at: Generated<string | null>;
  };
  invoice_items: {
    id: InvoiceItemId;
    invoice_id: InvoiceId;
    item_id: ItemId | null;
    description: string | null;
    quantity: number | null;
    unit_price: number | null;
    total_price: number | null;
    created_at: Generated<string | null>;
  };
  receipt_items: {
    id: ReceiptItemId;
    tenant_id: FranchiseGroupId;
    transaction_id: TransactionId | null;
    item_name: string;
    quantity: number | null;
    unit_price: number | null;
    total_price: number | null;
    vat_rate: number | null;
    source_type: Generated<string>;
    source_id: string;
    created_at: Generated<string | null>;
  };
  whatsapp_inbox: {
    id: WhatsAppInboxId;
    tenant_id: FranchiseGroupId;
    from_number: string;
    to_number: string;
    message_body: string | null;
    media_url: string | null;
    media_type: string | null;
    message_id: string | null;
    direction: WhatsAppDirection;
    status: WhatsAppInboxStatus;
    processed_at: string | null;
    created_at: Generated<string | null>;
  };
  whatsapp_outbox: {
    id: WhatsAppOutboxId;
    tenant_id: FranchiseGroupId;
    to_number: string;
    message_body: string | null;
    media_url: string | null;
    message_type: Generated<WhatsAppMessageType>;
    status: WhatsAppOutboxStatus;
    priority: Generated<number>;
    api_key_id: string | null;
    webhook_url: string | null;
    webhook_secret: string | null;
    idempotency_key: string | null;
    retry_count: Generated<number>;
    sent_at: string | null;
    processed_at: string | null;
    created_at: Generated<string | null>;
  };
  graph_sync_queue: {
    id: GraphSyncQueueId;
    tenant_id: FranchiseGroupId;
    entity_type: string;
    entity_id: string;
    operation: string;
    payload: Json | null;
    status: Generated<string>;
    retry_count: Generated<number>;
    max_retries: Generated<number>;
    last_error: string | null;
    processed_at: string | null;
    created_at: Generated<string | null>;
  };
  outbox_events: {
    id: OutboxEventId;
    tenant_id: FranchiseGroupId;
    event_type: string;
    payload: Json;
    status: Generated<string>;
    created_at: Generated<string | null>;
  };
  api_keys: {
    id: ApiKeyId;
    tenant_id: FranchiseGroupId;
    key_value: string;
    description: string | null;
    created_at: Generated<string | null>;
  };
  rate_limits: {
    id: RateLimitId;
    ip_hash: string;
    action: string;
    attempts: Generated<number>;
    window_start: Generated<string | null>;
    blocked_until: string | null;
  };
  system_telemetry: {
    id: TelemetryId;
    tenant_id: FranchiseGroupId | null;
    metric_name: string;
    metric_value: number;
    labels: Json | null;
    recorded_at: Generated<string | null>;
  };
  pos_batch_uploads: {
    id: PosBatchUploadId;
    tenant_id: FranchiseGroupId;
    location_id: RestaurantId;
    batch_id: string | null;
    source: string | null;
    status: PosBatchStatus;
    total_receipts: Generated<number>;
    approved_rows: Generated<number>;
    quarantined_rows: Generated<number>;
    period_start: string | null;
    period_end: string | null;
    received_at: Generated<string>;
    processed_at: string | null;
    error_detail: Json | null;
  };
  pos_transaction_staging: {
    id: PosTransactionStagingId;
    batch_id: PosBatchUploadId;
    tenant_id: FranchiseGroupId;
    location_id: RestaurantId;
    line_number: number;
    raw_payload: Json;
    transaction_time: string;
    receipt_number: string | null;
    item_sku: string | null;
    item_name: string | null;
    quantity: number | null;
    revenue: number | null;
    is_void: Generated<boolean>;
    is_comp: Generated<boolean>;
    recipe_found: boolean | null;
    theoretical_grams: Json | null;
    anomaly_score: number | null;
    anomaly_reason: string | null;
    flag: PosStagingFlag;
    created_at: Generated<string>;
  };
  pos_data_gaps: {
    id: PosDataGapId;
    tenant_id: FranchiseGroupId;
    location_id: RestaurantId;
    gap_date: string;
    notified_at: string | null;
    resolved_at: string | null;
  };
}

export type Tables<T extends keyof Database> = Selectable<Database[T]>;
export type TablesInsert<T extends keyof Database> = Insertable<Database[T]>;
export type TablesUpdate<T extends keyof Database> = Updateable<Database[T]>;
