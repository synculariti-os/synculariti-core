// Auto-generated from migration SQL - do not edit directly
// Run: node scripts/generate-supabase-types.mjs

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      notification_rules: {
        Row: {
          id: string | null
          event_type: string
          scope_type: string
          scope_id: string | null
          target_role: string
          channel: string
          priority: string
          title_template: string
          body_template: string | null
          action_url_template: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          event_type?: string | null
          scope_type?: string | null
          scope_id?: string | null
          target_role?: string | null
          channel?: string | null
          priority?: string | null
          title_template?: string | null
          body_template?: string | null
          action_url_template?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          event_type?: string | null
          scope_type?: string | null
          scope_id?: string | null
          target_role?: string | null
          channel?: string | null
          priority?: string | null
          title_template?: string | null
          body_template?: string | null
          action_url_template?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [

        ]
      }
      user_notification_preferences: {
        Row: {
          id: string | null
          user_id: string
          channel: string
          is_enabled: boolean
          quiet_hours_start: string | null
          quiet_hours_end: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          user_id?: string | null
          channel?: string | null
          is_enabled?: boolean | null
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          user_id?: string | null
          channel?: string | null
          is_enabled?: boolean | null
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      notification_queue: {
        Row: {
          id: string | null
          event_type: string
          title: string
          body: string | null
          priority: string
          reference_type: string | null
          reference_id: string | null
          source: string | null
          metadata: any
          restaurant_id: string | null
          franchise_group_id: string | null
          is_routed: boolean
          routed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          event_type?: string | null
          title?: string | null
          body?: string | null
          priority?: string | null
          reference_type?: string | null
          reference_id?: string | null
          source?: string | null
          metadata?: any | null
          restaurant_id?: string | null
          franchise_group_id?: string | null
          is_routed?: boolean | null
          routed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          event_type?: string | null
          title?: string | null
          body?: string | null
          priority?: string | null
          reference_type?: string | null
          reference_id?: string | null
          source?: string | null
          metadata?: any | null
          restaurant_id?: string | null
          franchise_group_id?: string | null
          is_routed?: boolean | null
          routed_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_franchise_group_id_fkey",
            columns: ["franchise_group_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_franchise_group_id_fkey__tenants",
            columns: ["franchise_group_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_franchise_group_id_fkey__tenants",
            columns: ["franchise_group_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_franchise_group_id_fkey__tenants",
            columns: ["franchise_group_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      notification_attempts: {
        Row: {
          id: string | null
          notification_queue_id: string
          user_id: string
          channel: string
          status: string
          whatsapp_outbox_id: string | null
          delivered_at: string | null
          read_at: string | null
          failed_at: string | null
          error: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          notification_queue_id?: string | null
          user_id?: string | null
          channel?: string | null
          status?: string | null
          whatsapp_outbox_id?: string | null
          delivered_at?: string | null
          read_at?: string | null
          failed_at?: string | null
          error?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          notification_queue_id?: string | null
          user_id?: string | null
          channel?: string | null
          status?: string | null
          whatsapp_outbox_id?: string | null
          delivered_at?: string | null
          read_at?: string | null
          failed_at?: string | null
          error?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_attempts_notification_queue_id_fkey",
            columns: ["notification_queue_id"],
            isOneToOne: false,
            referencedRelation: "notification_queue",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_attempts_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_attempts_whatsapp_outbox_id_fkey",
            columns: ["whatsapp_outbox_id"],
            isOneToOne: false,
            referencedRelation: "whatsapp_outbox",
            referencedColumns: ["id"]
          }
        ]
      }
      in_app_notifications: {
        Row: {
          id: string | null
          notification_attempt_id: string
          user_id: string
          title: string
          body: string | null
          is_read: boolean
          read_at: string | null
          action_url: string | null
          reference_type: string | null
          reference_id: string | null
          priority: string
          created_at: string
        }
        Insert: {
          id?: string | null
          notification_attempt_id?: string | null
          user_id?: string | null
          title?: string | null
          body?: string | null
          is_read?: boolean | null
          read_at?: string | null
          action_url?: string | null
          reference_type?: string | null
          reference_id?: string | null
          priority?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          notification_attempt_id?: string | null
          user_id?: string | null
          title?: string | null
          body?: string | null
          is_read?: boolean | null
          read_at?: string | null
          action_url?: string | null
          reference_type?: string | null
          reference_id?: string | null
          priority?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "in_app_notifications_notification_attempt_id_fkey",
            columns: ["notification_attempt_id"],
            isOneToOne: false,
            referencedRelation: "notification_attempts",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "in_app_notifications_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      domain_events: {
        Row: {
          id: string | null
          aggregate_id: string
          aggregate_type: string
          event_type: string
          payload: any
          metadata: any
          version: string
          created_at: string
        }
        Insert: {
          id?: string | null
          aggregate_id?: string | null
          aggregate_type?: string | null
          event_type?: string | null
          payload?: any | null
          metadata?: any | null
          version?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          aggregate_id?: string | null
          aggregate_type?: string | null
          event_type?: string | null
          payload?: any | null
          metadata?: any | null
          version?: string | null
          created_at?: string | null
        }
        Relationships: [

        ]
      }
      domain_event_types: {
        Row: {
          event_type: string | null
          aggregate_type: string
          description: string | null
          schema_def: any | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          event_type?: string | null
          aggregate_type?: string | null
          description?: string | null
          schema_def?: any | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          event_type?: string | null
          aggregate_type?: string | null
          description?: string | null
          schema_def?: any | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: [

        ]
      }
      projection_status: {
        Row: {
          projection_name: string | null
          last_event_id: string | null
          last_occurred_at: string | null
          is_stale: boolean
          last_refreshed_at: string | null
          error_count: number
          last_error: string | null
        }
        Insert: {
          projection_name?: string | null
          last_event_id?: string | null
          last_occurred_at?: string | null
          is_stale?: boolean | null
          last_refreshed_at?: string | null
          error_count?: number | null
          last_error?: string | null
        }
        Update: {
          projection_name?: string | null
          last_event_id?: string | null
          last_occurred_at?: string | null
          is_stale?: boolean | null
          last_refreshed_at?: string | null
          error_count?: number | null
          last_error?: string | null
        }
        Relationships: [

        ]
      }
      saga_instances: {
        Row: {
          id: string | null
          saga_type: string
          correlation_id: string
          status: string
          state: any
          tenant_id: string | null
          started_at: string
          completed_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          saga_type?: string | null
          correlation_id?: string | null
          status?: string | null
          state?: any | null
          tenant_id?: string | null
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          saga_type?: string | null
          correlation_id?: string | null
          status?: string | null
          state?: any | null
          tenant_id?: string | null
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string | null
        }
        Relationships: [

        ]
      }
      saga_steps: {
        Row: {
          id: string | null
          saga_instance_id: string
          step_name: string
          status: string
          event_type: string
          compensating_event_type: string | null
          executed_at: string | null
          compensated_at: string | null
        }
        Insert: {
          id?: string | null
          saga_instance_id?: string | null
          step_name?: string | null
          status?: string | null
          event_type?: string | null
          compensating_event_type?: string | null
          executed_at?: string | null
          compensated_at?: string | null
        }
        Update: {
          id?: string | null
          saga_instance_id?: string | null
          step_name?: string | null
          status?: string | null
          event_type?: string | null
          compensating_event_type?: string | null
          executed_at?: string | null
          compensated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saga_steps_saga_instance_id_fkey",
            columns: ["saga_instance_id"],
            isOneToOne: false,
            referencedRelation: "saga_instances",
            referencedColumns: ["id"]
          }
        ]
      }
      saga_definitions: {
        Row: {
          saga_type: string | null
          description: string | null
          step_definitions: any
          is_active: boolean
          created_at: string
        }
        Insert: {
          saga_type?: string | null
          description?: string | null
          step_definitions?: any | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          saga_type?: string | null
          description?: string | null
          step_definitions?: any | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: [

        ]
      }
      aggregate_snapshots: {
        Row: {
          aggregate_type: string
          aggregate_id: string
          snapshot_version: number
          state: any
          last_event_id: string | null
          created_at: string
        }
        Insert: {
          aggregate_type?: string | null
          aggregate_id?: string | null
          snapshot_version?: number | null
          state?: any | null
          last_event_id?: string | null
          created_at?: string | null
        }
        Update: {
          aggregate_type?: string | null
          aggregate_id?: string | null
          snapshot_version?: number | null
          state?: any | null
          last_event_id?: string | null
          created_at?: string | null
        }
        Relationships: [

        ]
      }
      vendor_portal_access: {
        Row: {
          id: string | null
          vendor_id: string
          email: string
          password_hash: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          vendor_id?: string | null
          email?: string | null
          password_hash?: string | null
          is_active?: boolean | null
          last_login?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          vendor_id?: string | null
          email?: string | null
          password_hash?: string | null
          is_active?: boolean | null
          last_login?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_portal_access_vendor_id_fkey",
            columns: ["vendor_id"],
            isOneToOne: false,
            referencedRelation: "vendors",
            referencedColumns: ["id"]
          }
        ]
      }
      vendor_catalog_items: {
        Row: {
          id: string | null
          vendor_id: string
          item_id: string | null
          vendor_sku: string
          vendor_item_name: string
          unit_price: number
          uom: string
          lead_time_days: number | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          vendor_id?: string | null
          item_id?: string | null
          vendor_sku?: string | null
          vendor_item_name?: string | null
          unit_price?: number | null
          uom?: string | null
          lead_time_days?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          vendor_id?: string | null
          item_id?: string | null
          vendor_sku?: string | null
          vendor_item_name?: string | null
          unit_price?: number | null
          uom?: string | null
          lead_time_days?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_catalog_items_vendor_id_fkey",
            columns: ["vendor_id"],
            isOneToOne: false,
            referencedRelation: "vendors",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_catalog_items_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_catalog_items_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_catalog_items_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      edi_config: {
        Row: {
          id: string | null
          vendor_id: string
          protocol: string
          endpoint_url: string | null
          credentials: any | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          vendor_id?: string | null
          protocol?: string | null
          endpoint_url?: string | null
          credentials?: any | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          vendor_id?: string | null
          protocol?: string | null
          endpoint_url?: string | null
          credentials?: any | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edi_config_vendor_id_fkey",
            columns: ["vendor_id"],
            isOneToOne: false,
            referencedRelation: "vendors",
            referencedColumns: ["id"]
          }
        ]
      }
      edi_transactions: {
        Row: {
          id: string | null
          vendor_id: string
          direction: string
          message_type: string
          payload: any | null
          status: string
          error: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          vendor_id?: string | null
          direction?: string | null
          message_type?: string | null
          payload?: any | null
          status?: string | null
          error?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          vendor_id?: string | null
          direction?: string | null
          message_type?: string | null
          payload?: any | null
          status?: string | null
          error?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edi_transactions_vendor_id_fkey",
            columns: ["vendor_id"],
            isOneToOne: false,
            referencedRelation: "vendors",
            referencedColumns: ["id"]
          }
        ]
      }
      production_plans: {
        Row: {
          id: string | null
          restaurant_id: string
          plan_name: string
          plan_date: string
          status: string
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          plan_name?: string | null
          plan_date?: string | null
          status?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          plan_name?: string | null
          plan_date?: string | null
          status?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_plans_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_plans_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_plans_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_plans_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      production_plan_items: {
        Row: {
          id: string | null
          production_plan_id: string
          recipe_id: string
          planned_qty: number
          actual_qty: number | null
          uom: string
          created_at: string
        }
        Insert: {
          id?: string | null
          production_plan_id?: string | null
          recipe_id?: string | null
          planned_qty?: number | null
          actual_qty?: number | null
          uom?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          production_plan_id?: string | null
          recipe_id?: string | null
          planned_qty?: number | null
          actual_qty?: number | null
          uom?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_plan_items_production_plan_id_fkey",
            columns: ["production_plan_id"],
            isOneToOne: false,
            referencedRelation: "production_plans",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_plan_items_recipe_id_fkey",
            columns: ["recipe_id"],
            isOneToOne: false,
            referencedRelation: "recipes",
            referencedColumns: ["id"]
          }
        ]
      }
      commissary_orders: {
        Row: {
          id: string | null
          commissary_location_id: string
          destination_restaurant_id: string
          order_date: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          commissary_location_id?: string | null
          destination_restaurant_id?: string | null
          order_date?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          commissary_location_id?: string | null
          destination_restaurant_id?: string | null
          order_date?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissary_orders_commissary_location_id_fkey",
            columns: ["commissary_location_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissary_orders_commissary_location_id_fkey__locations",
            columns: ["commissary_location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissary_orders_commissary_location_id_fkey__locations",
            columns: ["commissary_location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissary_orders_commissary_location_id_fkey__locations",
            columns: ["commissary_location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissary_orders_destination_restaurant_id_fkey",
            columns: ["destination_restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissary_orders_destination_restaurant_id_fkey__locations",
            columns: ["destination_restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissary_orders_destination_restaurant_id_fkey__locations",
            columns: ["destination_restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissary_orders_destination_restaurant_id_fkey__locations",
            columns: ["destination_restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      commissary_order_items: {
        Row: {
          id: string | null
          commissary_order_id: string
          item_id: string
          quantity_ordered: number
          quantity_shipped: number | null
          quantity_received: number | null
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string | null
          commissary_order_id?: string | null
          item_id?: string | null
          quantity_ordered?: number | null
          quantity_shipped?: number | null
          quantity_received?: number | null
          unit_price?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          commissary_order_id?: string | null
          item_id?: string | null
          quantity_ordered?: number | null
          quantity_shipped?: number | null
          quantity_received?: number | null
          unit_price?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissary_order_items_commissary_order_id_fkey",
            columns: ["commissary_order_id"],
            isOneToOne: false,
            referencedRelation: "commissary_orders",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissary_order_items_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissary_order_items_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissary_order_items_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      transfer_pricing_rules: {
        Row: {
          id: string | null
          from_location_id: string
          to_location_id: string | null
          item_id: string | null
          markup_percent: number
          effective_from: string
          effective_to: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          from_location_id?: string | null
          to_location_id?: string | null
          item_id?: string | null
          markup_percent?: number | null
          effective_from?: string | null
          effective_to?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          from_location_id?: string | null
          to_location_id?: string | null
          item_id?: string | null
          markup_percent?: number | null
          effective_from?: string | null
          effective_to?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_pricing_rules_from_location_id_fkey",
            columns: ["from_location_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_pricing_rules_from_location_id_fkey__locations",
            columns: ["from_location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_pricing_rules_from_location_id_fkey__locations",
            columns: ["from_location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_pricing_rules_from_location_id_fkey__locations",
            columns: ["from_location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_pricing_rules_to_location_id_fkey",
            columns: ["to_location_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_pricing_rules_to_location_id_fkey__locations",
            columns: ["to_location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_pricing_rules_to_location_id_fkey__locations",
            columns: ["to_location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_pricing_rules_to_location_id_fkey__locations",
            columns: ["to_location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_pricing_rules_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_pricing_rules_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_pricing_rules_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      cost_centers: {
        Row: {
          id: string | null
          restaurant_id: string
          name: string
          code: string | null
          type: string
          parent_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          name?: string | null
          code?: string | null
          type?: string | null
          parent_id?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          name?: string | null
          code?: string | null
          type?: string | null
          parent_id?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_centers_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_centers_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_centers_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_centers_parent_id_fkey",
            columns: ["parent_id"],
            isOneToOne: false,
            referencedRelation: "cost_centers",
            referencedColumns: ["id"]
          }
        ]
      }
      intercompany_transactions: {
        Row: {
          id: string | null
          from_center_id: string
          to_center_id: string
          amount: number
          currency: string
          description: string | null
          transaction_date: string
          is_eliminated: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          from_center_id?: string | null
          to_center_id?: string | null
          amount?: number | null
          currency?: string | null
          description?: string | null
          transaction_date?: string | null
          is_eliminated?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          from_center_id?: string | null
          to_center_id?: string | null
          amount?: number | null
          currency?: string | null
          description?: string | null
          transaction_date?: string | null
          is_eliminated?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intercompany_transactions_from_center_id_fkey",
            columns: ["from_center_id"],
            isOneToOne: false,
            referencedRelation: "cost_centers",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intercompany_transactions_to_center_id_fkey",
            columns: ["to_center_id"],
            isOneToOne: false,
            referencedRelation: "cost_centers",
            referencedColumns: ["id"]
          }
        ]
      }
      bank_accounts: {
        Row: {
          id: string | null
          restaurant_id: string | null
          account_name: string
          account_number: string
          bank_name: string
          currency: string
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          currency?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          currency?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      bank_transactions: {
        Row: {
          id: string | null
          bank_account_id: string
          transaction_date: string
          description: string
          amount: number
          reference: string | null
          category: string | null
          is_reconciled: boolean
          created_at: string
        }
        Insert: {
          id?: string | null
          bank_account_id?: string | null
          transaction_date?: string | null
          description?: string | null
          amount?: number | null
          reference?: string | null
          category?: string | null
          is_reconciled?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          bank_account_id?: string | null
          transaction_date?: string | null
          description?: string | null
          amount?: number | null
          reference?: string | null
          category?: string | null
          is_reconciled?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_account_id_fkey",
            columns: ["bank_account_id"],
            isOneToOne: false,
            referencedRelation: "bank_accounts",
            referencedColumns: ["id"]
          }
        ]
      }
      reconciliation_entries: {
        Row: {
          id: string | null
          bank_transaction_id: string
          reconciled_to_type: string
          reconciled_to_id: string
          amount: number
          status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          bank_transaction_id?: string | null
          reconciled_to_type?: string | null
          reconciled_to_id?: string | null
          amount?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          bank_transaction_id?: string | null
          reconciled_to_type?: string | null
          reconciled_to_id?: string | null
          amount?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reconciliation_entries_bank_transaction_id_fkey",
            columns: ["bank_transaction_id"],
            isOneToOne: false,
            referencedRelation: "bank_transactions",
            referencedColumns: ["id"]
          }
        ]
      }
      data_retention_policies: {
        Row: {
          id: string | null
          table_name: string
          retention_days: number
          archive_to: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          table_name?: string | null
          retention_days?: number | null
          archive_to?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          table_name?: string | null
          retention_days?: number | null
          archive_to?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [

        ]
      }
      pii_data_classification: {
        Row: {
          id: string | null
          table_name: string
          column_name: string
          classification: string
          is_encrypted: boolean
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          table_name?: string | null
          column_name?: string | null
          classification?: string | null
          is_encrypted?: boolean | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          table_name?: string | null
          column_name?: string | null
          classification?: string | null
          is_encrypted?: boolean | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [

        ]
      }
      gdpr_export_requests: {
        Row: {
          id: string | null
          request_type: string
          requestor_email: string
          status: string
          data: any | null
          completed_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          request_type?: string | null
          requestor_email?: string | null
          status?: string | null
          data?: any | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          request_type?: string | null
          requestor_email?: string | null
          status?: string | null
          data?: any | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [

        ]
      }
      guest_profiles: {
        Row: {
          id: string | null
          restaurant_id: string
          first_name: string
          last_name: string | null
          email: string | null
          phone: string | null
          date_of_birth: string | null
          notes: string | null
          tags: any | null
          preferences: any | null
          created_at: string
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          notes?: string | null
          tags?: any | null
          preferences?: any | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          notes?: string | null
          tags?: any | null
          preferences?: any | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_profiles_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_profiles_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_profiles_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_profiles_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      guest_visits: {
        Row: {
          id: string | null
          guest_profile_id: string
          restaurant_id: string
          visit_date: string
          party_size: number
          total_spent: number | null
          source: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          guest_profile_id?: string | null
          restaurant_id?: string | null
          visit_date?: string | null
          party_size?: number | null
          total_spent?: number | null
          source?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          guest_profile_id?: string | null
          restaurant_id?: string | null
          visit_date?: string | null
          party_size?: number | null
          total_spent?: number | null
          source?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_visits_guest_profile_id_fkey",
            columns: ["guest_profile_id"],
            isOneToOne: false,
            referencedRelation: "guest_profiles",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_visits_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_visits_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_visits_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_visits_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      loyalty_accounts: {
        Row: {
          id: string | null
          guest_profile_id: string
          restaurant_id: string
          points_balance: number
          lifetime_points: number
          tier: string
          enrolled_at: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          guest_profile_id?: string | null
          restaurant_id?: string | null
          points_balance?: number | null
          lifetime_points?: number | null
          tier?: string | null
          enrolled_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          guest_profile_id?: string | null
          restaurant_id?: string | null
          points_balance?: number | null
          lifetime_points?: number | null
          tier?: string | null
          enrolled_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_accounts_guest_profile_id_fkey",
            columns: ["guest_profile_id"],
            isOneToOne: false,
            referencedRelation: "guest_profiles",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_accounts_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_accounts_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_accounts_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_accounts_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      loyalty_points_transactions: {
        Row: {
          id: string | null
          loyalty_account_id: string
          points: number
          transaction_type: string
          reference_type: string | null
          reference_id: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          loyalty_account_id?: string | null
          points?: number | null
          transaction_type?: string | null
          reference_type?: string | null
          reference_id?: string | null
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          loyalty_account_id?: string | null
          points?: number | null
          transaction_type?: string | null
          reference_type?: string | null
          reference_id?: string | null
          description?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_transactions_loyalty_account_id_fkey",
            columns: ["loyalty_account_id"],
            isOneToOne: false,
            referencedRelation: "loyalty_accounts",
            referencedColumns: ["id"]
          }
        ]
      }
      loyalty_rewards: {
        Row: {
          id: string | null
          restaurant_id: string
          name: string
          description: string | null
          points_required: number
          reward_type: string
          reward_value: number | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          name?: string | null
          description?: string | null
          points_required?: number | null
          reward_type?: string | null
          reward_value?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          name?: string | null
          description?: string | null
          points_required?: number | null
          reward_type?: string | null
          reward_value?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_rewards_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_rewards_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_rewards_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      floor_plans: {
        Row: {
          id: string | null
          restaurant_id: string
          name: string
          layout_data: any | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          name?: string | null
          layout_data?: any | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          name?: string | null
          layout_data?: any | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "floor_plans_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "floor_plans_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "floor_plans_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "floor_plans_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      restaurant_tables: {
        Row: {
          id: string | null
          restaurant_id: string
          floor_plan_id: string | null
          table_number: string
          capacity: number
          section: string | null
          position_x: number | null
          position_y: number | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          floor_plan_id?: string | null
          table_number?: string | null
          capacity?: number | null
          section?: string | null
          position_x?: number | null
          position_y?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          floor_plan_id?: string | null
          table_number?: string | null
          capacity?: number | null
          section?: string | null
          position_x?: number | null
          position_y?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_tables_floor_plan_id_fkey",
            columns: ["floor_plan_id"],
            isOneToOne: false,
            referencedRelation: "floor_plans",
            referencedColumns: ["id"]
          }
        ]
      }
      reservations: {
        Row: {
          id: string | null
          restaurant_id: string
          guest_profile_id: string | null
          reservation_date: string
          reservation_time: string
          party_size: number
          status: string
          special_requests: string | null
          source: string | null
          created_by: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          guest_profile_id?: string | null
          reservation_date?: string | null
          reservation_time?: string | null
          party_size?: number | null
          status?: string | null
          special_requests?: string | null
          source?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          guest_profile_id?: string | null
          reservation_date?: string | null
          reservation_time?: string | null
          party_size?: number | null
          status?: string | null
          special_requests?: string | null
          source?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_guest_profile_id_fkey",
            columns: ["guest_profile_id"],
            isOneToOne: false,
            referencedRelation: "guest_profiles",
            referencedColumns: ["id"]
          }
        ]
      }
      reservation_tables: {
        Row: {
          id: string | null
          reservation_id: string
          table_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          reservation_id?: string | null
          table_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          reservation_id?: string | null
          table_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservation_tables_reservation_id_fkey",
            columns: ["reservation_id"],
            isOneToOne: false,
            referencedRelation: "reservations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_tables_table_id_fkey",
            columns: ["table_id"],
            isOneToOne: false,
            referencedRelation: "restaurant_tables",
            referencedColumns: ["id"]
          }
        ]
      }
      waitlist_entries: {
        Row: {
          id: string | null
          restaurant_id: string
          guest_name: string
          phone: string | null
          party_size: number
          estimated_wait_minutes: number | null
          status: string
          notified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          guest_name?: string | null
          phone?: string | null
          party_size?: number | null
          estimated_wait_minutes?: number | null
          status?: string | null
          notified_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          guest_name?: string | null
          phone?: string | null
          party_size?: number | null
          estimated_wait_minutes?: number | null
          status?: string | null
          notified_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_entries_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_entries_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_entries_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      kds_stations: {
        Row: {
          id: string | null
          restaurant_id: string
          name: string
          station_type: string
          printer_name: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          name?: string | null
          station_type?: string | null
          printer_name?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          name?: string | null
          station_type?: string | null
          printer_name?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kds_stations_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kds_stations_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kds_stations_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kds_stations_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      kitchen_tickets: {
        Row: {
          id: string | null
          restaurant_id: string
          ticket_number: string
          guest_name: string | null
          table_number: string | null
          status: string
          priority: number
          pos_transaction_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          ticket_number?: string | null
          guest_name?: string | null
          table_number?: string | null
          status?: string | null
          priority?: number | null
          pos_transaction_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          ticket_number?: string | null
          guest_name?: string | null
          table_number?: string | null
          status?: string | null
          priority?: number | null
          pos_transaction_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_tickets_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitchen_tickets_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitchen_tickets_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitchen_tickets_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      ticket_items: {
        Row: {
          id: string | null
          ticket_id: string
          item_name: string
          item_id: string | null
          quantity: number
          modifiers: any | null
          status: string
          station_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          ticket_id?: string | null
          item_name?: string | null
          item_id?: string | null
          quantity?: number | null
          modifiers?: any | null
          status?: string | null
          station_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          ticket_id?: string | null
          item_name?: string | null
          item_id?: string | null
          quantity?: number | null
          modifiers?: any | null
          status?: string | null
          station_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_items_ticket_id_fkey",
            columns: ["ticket_id"],
            isOneToOne: false,
            referencedRelation: "kitchen_tickets",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_items_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_items_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_items_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_items_station_id_fkey",
            columns: ["station_id"],
            isOneToOne: false,
            referencedRelation: "kds_stations",
            referencedColumns: ["id"]
          }
        ]
      }
      ticket_routing: {
        Row: {
          id: string | null
          ticket_item_id: string
          station_id: string
          sequence_order: number
          status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          ticket_item_id?: string | null
          station_id?: string | null
          sequence_order?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          ticket_item_id?: string | null
          station_id?: string | null
          sequence_order?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_routing_ticket_item_id_fkey",
            columns: ["ticket_item_id"],
            isOneToOne: false,
            referencedRelation: "ticket_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_routing_station_id_fkey",
            columns: ["station_id"],
            isOneToOne: false,
            referencedRelation: "kds_stations",
            referencedColumns: ["id"]
          }
        ]
      }
      guest_feedback: {
        Row: {
          id: string | null
          restaurant_id: string
          guest_profile_id: string | null
          visit_date: string | null
          rating: number
          comment: string | null
          category: string | null
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          guest_profile_id?: string | null
          visit_date?: string | null
          rating?: number | null
          comment?: string | null
          category?: string | null
          source?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          guest_profile_id?: string | null
          visit_date?: string | null
          rating?: number | null
          comment?: string | null
          category?: string | null
          source?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_feedback_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_feedback_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_feedback_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_feedback_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_feedback_guest_profile_id_fkey",
            columns: ["guest_profile_id"],
            isOneToOne: false,
            referencedRelation: "guest_profiles",
            referencedColumns: ["id"]
          }
        ]
      }
      survey_responses: {
        Row: {
          id: string | null
          restaurant_id: string
          guest_profile_id: string | null
          survey_name: string
          question: string
          response: string | null
          response_score: number | null
          created_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          guest_profile_id?: string | null
          survey_name?: string | null
          question?: string | null
          response?: string | null
          response_score?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          guest_profile_id?: string | null
          survey_name?: string | null
          question?: string | null
          response?: string | null
          response_score?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_guest_profile_id_fkey",
            columns: ["guest_profile_id"],
            isOneToOne: false,
            referencedRelation: "guest_profiles",
            referencedColumns: ["id"]
          }
        ]
      }
      shifts: {
        Row: {
          id: string | null
          restaurant_id: string
          role: string
          shift_date: string
          shift_start: string
          shift_end: string
          wage: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          role?: string | null
          shift_date?: string | null
          shift_start?: string | null
          shift_end?: string | null
          wage?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          role?: string | null
          shift_date?: string | null
          shift_start?: string | null
          shift_end?: string | null
          wage?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      time_entries: {
        Row: {
          id: string | null
          shift_id: string | null
          restaurant_id: string
          employee_name: string
          entry_date: string
          clock_in: string
          clock_out: string | null
          break_start: string | null
          break_end: string | null
          total_hours: number
          created_at: string
        }
        Insert: {
          id?: string | null
          shift_id?: string | null
          restaurant_id?: string | null
          employee_name?: string | null
          entry_date?: string | null
          clock_in?: string | null
          clock_out?: string | null
          break_start?: string | null
          break_end?: string | null
          total_hours?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          shift_id?: string | null
          restaurant_id?: string | null
          employee_name?: string | null
          entry_date?: string | null
          clock_in?: string | null
          clock_out?: string | null
          break_start?: string | null
          break_end?: string | null
          total_hours?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_shift_id_fkey",
            columns: ["shift_id"],
            isOneToOne: false,
            referencedRelation: "shifts",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      labor_standards: {
        Row: {
          id: string | null
          restaurant_id: string
          revenue_min: number
          revenue_max: number | null
          target_labor_percent: number
          role: string | null
          effective_from: string
          effective_to: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          revenue_min?: number | null
          revenue_max?: number | null
          target_labor_percent?: number | null
          role?: string | null
          effective_from?: string | null
          effective_to?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          revenue_min?: number | null
          revenue_max?: number | null
          target_labor_percent?: number | null
          role?: string | null
          effective_from?: string | null
          effective_to?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labor_standards_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_standards_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_standards_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_standards_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      labor_cost_actuals: {
        Row: {
          id: string | null
          restaurant_id: string
          period_start: string
          period_end: string
          total_hours: number
          total_wages: number
          revenue: number | null
          labor_percent: number | null
          created_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          period_start?: string | null
          period_end?: string | null
          total_hours?: number | null
          total_wages?: number | null
          revenue?: number | null
          labor_percent?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          period_start?: string | null
          period_end?: string | null
          total_hours?: number | null
          total_wages?: number | null
          revenue?: number | null
          labor_percent?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labor_cost_actuals_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_cost_actuals_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_cost_actuals_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_cost_actuals_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      goods_receipts: {
        Row: {
          id: string | null
          po_id: string
          restaurant_id: string
          received_date: string
          status: string
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          po_id?: string | null
          restaurant_id?: string | null
          received_date?: string | null
          status?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          po_id?: string | null
          restaurant_id?: string | null
          received_date?: string | null
          status?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_po_id_fkey",
            columns: ["po_id"],
            isOneToOne: false,
            referencedRelation: "purchase_orders",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      goods_receipt_items: {
        Row: {
          id: string | null
          goods_receipt_id: string
          po_line_item_id: string
          item_id: string
          quantity_received: number
          quantity_accepted: number
          quantity_rejected: number
          rejection_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          goods_receipt_id?: string | null
          po_line_item_id?: string | null
          item_id?: string | null
          quantity_received?: number | null
          quantity_accepted?: number | null
          quantity_rejected?: number | null
          rejection_reason?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          goods_receipt_id?: string | null
          po_line_item_id?: string | null
          item_id?: string | null
          quantity_received?: number | null
          quantity_accepted?: number | null
          quantity_rejected?: number | null
          rejection_reason?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_items_goods_receipt_id_fkey",
            columns: ["goods_receipt_id"],
            isOneToOne: false,
            referencedRelation: "goods_receipts",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_items_po_line_item_id_fkey",
            columns: ["po_line_item_id"],
            isOneToOne: false,
            referencedRelation: "po_line_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_items_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_items_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_items_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      three_way_match_results: {
        Row: {
          id: string | null
          po_id: string
          goods_receipt_id: string
          invoice_id: string | null
          po_line_item_id: string
          status: string
          po_quantity: number | null
          received_quantity: number | null
          invoice_quantity: number | null
          po_price: number | null
          invoice_price: number | null
          variance_quantity: number | null
          variance_price: number | null
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          po_id?: string | null
          goods_receipt_id?: string | null
          invoice_id?: string | null
          po_line_item_id?: string | null
          status?: string | null
          po_quantity?: number | null
          received_quantity?: number | null
          invoice_quantity?: number | null
          po_price?: number | null
          invoice_price?: number | null
          variance_quantity?: number | null
          variance_price?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          po_id?: string | null
          goods_receipt_id?: string | null
          invoice_id?: string | null
          po_line_item_id?: string | null
          status?: string | null
          po_quantity?: number | null
          received_quantity?: number | null
          invoice_quantity?: number | null
          po_price?: number | null
          invoice_price?: number | null
          variance_quantity?: number | null
          variance_price?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "three_way_match_results_po_id_fkey",
            columns: ["po_id"],
            isOneToOne: false,
            referencedRelation: "purchase_orders",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "three_way_match_results_goods_receipt_id_fkey",
            columns: ["goods_receipt_id"],
            isOneToOne: false,
            referencedRelation: "goods_receipts",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "three_way_match_results_invoice_id_fkey",
            columns: ["invoice_id"],
            isOneToOne: false,
            referencedRelation: "invoices",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "three_way_match_results_po_line_item_id_fkey",
            columns: ["po_line_item_id"],
            isOneToOne: false,
            referencedRelation: "po_line_items",
            referencedColumns: ["id"]
          }
        ]
      }
      menu_versions: {
        Row: {
          id: string | null
          restaurant_id: string
          name: string
          effective_from: string
          effective_to: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          name?: string | null
          effective_from?: string | null
          effective_to?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          name?: string | null
          effective_from?: string | null
          effective_to?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_versions_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_versions_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_versions_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_versions_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      menu_version_items: {
        Row: {
          id: string | null
          menu_version_id: string
          item_id: string
          price: number
          available: boolean
          sort_order: number | null
          created_at: string
        }
        Insert: {
          id?: string | null
          menu_version_id?: string | null
          item_id?: string | null
          price?: number | null
          available?: boolean | null
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          menu_version_id?: string | null
          item_id?: string | null
          price?: number | null
          available?: boolean | null
          sort_order?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_version_items_menu_version_id_fkey",
            columns: ["menu_version_id"],
            isOneToOne: false,
            referencedRelation: "menu_versions",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_version_items_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_version_items_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_version_items_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      item_allergens: {
        Row: {
          id: string | null
          item_id: string
          allergen: string
          created_at: string
        }
        Insert: {
          id?: string | null
          item_id?: string | null
          allergen?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          item_id?: string | null
          allergen?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_allergens_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_allergens_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_allergens_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      item_nutritionals: {
        Row: {
          id: string | null
          item_id: string
          serving_size: string | null
          calories: number | null
          fat_g: number | null
          saturated_fat_g: number | null
          protein_g: number | null
          carbs_g: number | null
          fiber_g: number | null
          sugar_g: number | null
          sodium_mg: number | null
          cholesterol_mg: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          item_id?: string | null
          serving_size?: string | null
          calories?: number | null
          fat_g?: number | null
          saturated_fat_g?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          cholesterol_mg?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          item_id?: string | null
          serving_size?: string | null
          calories?: number | null
          fat_g?: number | null
          saturated_fat_g?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          cholesterol_mg?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_nutritionals_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_nutritionals_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_nutritionals_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      recipe_cost_snapshots: {
        Row: {
          id: string | null
          recipe_id: string
          snapshot_date: string
          cost_per_unit: number | null
          total_cost: number | null
          yield_qty: number | null
          ingredient_count: number | null
          created_at: string
        }
        Insert: {
          id?: string | null
          recipe_id?: string | null
          snapshot_date?: string | null
          cost_per_unit?: number | null
          total_cost?: number | null
          yield_qty?: number | null
          ingredient_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          recipe_id?: string | null
          snapshot_date?: string | null
          cost_per_unit?: number | null
          total_cost?: number | null
          yield_qty?: number | null
          ingredient_count?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_cost_snapshots_recipe_id_fkey",
            columns: ["recipe_id"],
            isOneToOne: false,
            referencedRelation: "recipes",
            referencedColumns: ["id"]
          }
        ]
      }
      accounting_periods: {
        Row: {
          id: string | null
          tenant_id: string
          name: string
          start_date: string
          end_date: string
          closed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          name?: string | null
          start_date?: string | null
          end_date?: string | null
          closed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          name?: string | null
          start_date?: string | null
          end_date?: string | null
          closed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_periods_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_periods_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_periods_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_periods_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      exchange_rates: {
        Row: {
          id: string | null
          date: string
          currency: string
          rate: number
          created_at: string
        }
        Insert: {
          id?: string | null
          date?: string | null
          currency?: string | null
          rate?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          date?: string | null
          currency?: string | null
          rate?: number | null
          created_at?: string | null
        }
        Relationships: [

        ]
      }
      tenant_settings: {
        Row: {
          id: string | null
          tenant_id: string
          branding: any | null
          config: any | null
          feature_flags: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          branding?: any | null
          config?: any | null
          feature_flags?: any | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          branding?: any | null
          config?: any | null
          feature_flags?: any | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      et_purchase_orders: {
        Row: {
          id: string | null
          tenant_id: string
          location_id: string | null
          vendor_id: string | null
          status: string
          order_date: string
          total_amount: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          location_id?: string | null
          vendor_id?: string | null
          status?: string | null
          order_date?: string | null
          total_amount?: number | null
          currency?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          location_id?: string | null
          vendor_id?: string | null
          status?: string | null
          order_date?: string | null
          total_amount?: number | null
          currency?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "et_purchase_orders_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_purchase_orders_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_purchase_orders_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_purchase_orders_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_purchase_orders_location_id_fkey",
            columns: ["location_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_purchase_orders_location_id_fkey__locations",
            columns: ["location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_purchase_orders_location_id_fkey__locations",
            columns: ["location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_purchase_orders_location_id_fkey__locations",
            columns: ["location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      et_inventory_ledger: {
        Row: {
          id: string | null
          tenant_id: string
          location_id: string | null
          item_id: string
          change_amount: number
          reason: string
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          location_id?: string | null
          item_id?: string | null
          change_amount?: number | null
          reason?: string | null
          reference_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          location_id?: string | null
          item_id?: string | null
          change_amount?: number | null
          reason?: string | null
          reference_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "et_inventory_ledger_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_inventory_ledger_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_inventory_ledger_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_inventory_ledger_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_inventory_ledger_location_id_fkey",
            columns: ["location_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_inventory_ledger_location_id_fkey__locations",
            columns: ["location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_inventory_ledger_location_id_fkey__locations",
            columns: ["location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_inventory_ledger_location_id_fkey__locations",
            columns: ["location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_inventory_ledger_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_inventory_ledger_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "et_inventory_ledger_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      cached_ingredients: {
        Row: {
          id: string | null
          tenant_id: string
          external_id: string
          name: string
          category: string | null
          unit: string | null
          raw_data: any | null
          created_at: string
          updated_at: string
          ingredient_id: string | null
          canonical_name: string | null
          base_unit: string | null
          perishability_days: number | null
          current_stock_grams: number | null
          cost_per_gram: number | null
          fetched_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          external_id?: string | null
          name?: string | null
          category?: string | null
          unit?: string | null
          raw_data?: any | null
          created_at?: string | null
          updated_at?: string | null
          ingredient_id?: string | null
          canonical_name?: string | null
          base_unit?: string | null
          perishability_days?: number | null
          current_stock_grams?: number | null
          cost_per_gram?: number | null
          fetched_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          external_id?: string | null
          name?: string | null
          category?: string | null
          unit?: string | null
          raw_data?: any | null
          created_at?: string | null
          updated_at?: string | null
          ingredient_id?: string | null
          canonical_name?: string | null
          base_unit?: string | null
          perishability_days?: number | null
          current_stock_grams?: number | null
          cost_per_gram?: number | null
          fetched_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cached_ingredients_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_ingredients_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_ingredients_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_ingredients_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_ingredients_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_ingredients_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_ingredients_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_ingredients_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      franchise_groups: {
        Row: {
          id: string | null
          name: string
          pin: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          handle: string | null
          categories: any
          config: any
        }
        Insert: {
          id?: string | null
          name?: string | null
          pin?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          handle?: string | null
          categories?: any | null
          config?: any | null
        }
        Update: {
          id?: string | null
          name?: string | null
          pin?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          handle?: string | null
          categories?: any | null
          config?: any | null
        }
        Relationships: [

        ]
      }
      restaurants: {
        Row: {
          id: string | null
          franchise_group_id: string
          name: string
          timezone: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          address: string | null
        }
        Insert: {
          id?: string | null
          franchise_group_id?: string | null
          name?: string | null
          timezone?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          address?: string | null
        }
        Update: {
          id?: string | null
          franchise_group_id?: string | null
          name?: string | null
          timezone?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_franchise_group_id_fkey",
            columns: ["franchise_group_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_franchise_group_id_fkey__tenants",
            columns: ["franchise_group_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_franchise_group_id_fkey__tenants",
            columns: ["franchise_group_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_franchise_group_id_fkey__tenants",
            columns: ["franchise_group_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string | null
          email: string
          full_name: string
          phone_number: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string | null
          email?: string | null
          full_name?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string | null
          email?: string | null
          full_name?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [

        ]
      }
      roles: {
        Row: {
          id: string | null
          name: string
          description: string | null
          is_system: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string | null
          name?: string | null
          description?: string | null
          is_system?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string | null
          name?: string | null
          description?: string | null
          is_system?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [

        ]
      }
      permissions: {
        Row: {
          id: string | null
          code: string
          name: string
          description: string | null
          module: string
          created_at: string
        }
        Insert: {
          id?: string | null
          code?: string | null
          name?: string | null
          description?: string | null
          module?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          code?: string | null
          name?: string | null
          description?: string | null
          module?: string | null
          created_at?: string | null
        }
        Relationships: [

        ]
      }
      role_permissions: {
        Row: {
          role_id: string
          permission_id: string
        }
        Insert: {
          role_id?: string | null
          permission_id?: string | null
        }
        Update: {
          role_id?: string | null
          permission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey",
            columns: ["role_id"],
            isOneToOne: false,
            referencedRelation: "roles",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey",
            columns: ["permission_id"],
            isOneToOne: false,
            referencedRelation: "permissions",
            referencedColumns: ["id"]
          }
        ]
      }
      user_restaurant_roles: {
        Row: {
          id: string | null
          user_id: string
          restaurant_id: string
          role_id: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string | null
          user_id?: string | null
          restaurant_id?: string | null
          role_id?: string | null
          is_primary?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          user_id?: string | null
          restaurant_id?: string | null
          role_id?: string | null
          is_primary?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_restaurant_roles_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restaurant_roles_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restaurant_roles_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restaurant_roles_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restaurant_roles_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restaurant_roles_role_id_fkey",
            columns: ["role_id"],
            isOneToOne: false,
            referencedRelation: "roles",
            referencedColumns: ["id"]
          }
        ]
      }
      item_categories: {
        Row: {
          id: string | null
          tenant_id: string
          name: string
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
          item_type: string | null
          category_group: string | null
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          name?: string | null
          description?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          item_type?: string | null
          category_group?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          name?: string | null
          description?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          item_type?: string | null
          category_group?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_categories_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_categories_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_categories_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_categories_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      items: {
        Row: {
          id: string | null
          tenant_id: string
          category_id: string
          name: string
          sku: string | null
          barcode: string | null
          unit: string
          unit_price: number | null
          par_level: number | null
          reorder_point: number | null
          stock_on_hand: number
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
          type: string
          purchasing_uom: string
          inventory_uom: string
          recipe_uom: string | null
          inv_to_recipe_ratio: number | null
          allergen_info: string | null
          supplier_sku: string | null
          unit_cost: number | null
          restaurant_id: string | null
          conversion_factor: number
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          category_id?: string | null
          name?: string | null
          sku?: string | null
          barcode?: string | null
          unit?: string | null
          unit_price?: number | null
          par_level?: number | null
          reorder_point?: number | null
          stock_on_hand?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          type?: string | null
          purchasing_uom?: string | null
          inventory_uom?: string | null
          recipe_uom?: string | null
          inv_to_recipe_ratio?: number | null
          allergen_info?: string | null
          supplier_sku?: string | null
          unit_cost?: number | null
          restaurant_id?: string | null
          conversion_factor?: number | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          category_id?: string | null
          name?: string | null
          sku?: string | null
          barcode?: string | null
          unit?: string | null
          unit_price?: number | null
          par_level?: number | null
          reorder_point?: number | null
          stock_on_hand?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          type?: string | null
          purchasing_uom?: string | null
          inventory_uom?: string | null
          recipe_uom?: string | null
          inv_to_recipe_ratio?: number | null
          allergen_info?: string | null
          supplier_sku?: string | null
          unit_cost?: number | null
          restaurant_id?: string | null
          conversion_factor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "items_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_category_id_fkey",
            columns: ["category_id"],
            isOneToOne: false,
            referencedRelation: "item_categories",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_category_id_fkey__inventory_categories",
            columns: ["category_id"],
            isOneToOne: false,
            referencedRelation: "inventory_categories",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_category_id_fkey__inventory_categories",
            columns: ["category_id"],
            isOneToOne: false,
            referencedRelation: "inventory_categories",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      item_restaurant_overrides: {
        Row: {
          id: string | null
          item_id: string
          restaurant_id: string
          par_level: number | null
          reorder_point: number | null
          stock_on_hand: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          item_id?: string | null
          restaurant_id?: string | null
          par_level?: number | null
          reorder_point?: number | null
          stock_on_hand?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          item_id?: string | null
          restaurant_id?: string | null
          par_level?: number | null
          reorder_point?: number | null
          stock_on_hand?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_restaurant_overrides_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_restaurant_overrides_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_restaurant_overrides_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_restaurant_overrides_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_restaurant_overrides_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_restaurant_overrides_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_restaurant_overrides_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      uom_conversions: {
        Row: {
          id: string | null
          tenant_id: string
          from_unit: string
          to_unit: string
          factor: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          from_unit?: string | null
          to_unit?: string | null
          factor?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          from_unit?: string | null
          to_unit?: string | null
          factor?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uom_conversions_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uom_conversions_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uom_conversions_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uom_conversions_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      vendors: {
        Row: {
          id: string | null
          tenant_id: string
          name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          address: string | null
          payment_terms: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          name?: string | null
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          payment_terms?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          name?: string | null
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          payment_terms?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_orders: {
        Row: {
          id: string | null
          tenant_id: string
          restaurant_id: string | null
          vendor_id: string
          po_number: string
          status: string
          order_date: string
          expected_date: string | null
          delivered_date: string | null
          notes: string | null
          total_amount: number | null
          invoice_ref: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          delivery_status: string | null
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          restaurant_id?: string | null
          vendor_id?: string | null
          po_number?: string | null
          status?: string | null
          order_date?: string | null
          expected_date?: string | null
          delivered_date?: string | null
          notes?: string | null
          total_amount?: number | null
          invoice_ref?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          delivery_status?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          restaurant_id?: string | null
          vendor_id?: string | null
          po_number?: string | null
          status?: string | null
          order_date?: string | null
          expected_date?: string | null
          delivered_date?: string | null
          notes?: string | null
          total_amount?: number | null
          invoice_ref?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          delivery_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey",
            columns: ["vendor_id"],
            isOneToOne: false,
            referencedRelation: "vendors",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey",
            columns: ["created_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      po_line_items: {
        Row: {
          id: string | null
          po_id: string
          item_id: string
          quantity_ordered: number
          quantity_received: number | null
          unit_cost: number
          total_cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          po_id?: string | null
          item_id?: string | null
          quantity_ordered?: number | null
          quantity_received?: number | null
          unit_cost?: number | null
          total_cost?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          po_id?: string | null
          item_id?: string | null
          quantity_ordered?: number | null
          quantity_received?: number | null
          unit_cost?: number | null
          total_cost?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "po_line_items_po_id_fkey",
            columns: ["po_id"],
            isOneToOne: false,
            referencedRelation: "purchase_orders",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_line_items_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_line_items_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_line_items_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_batches: {
        Row: {
          id: string | null
          restaurant_id: string
          item_id: string
          batch_ref: string | null
          quantity: number
          unit_cost: number
          received_date: string
          expiry_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          item_id?: string | null
          batch_ref?: string | null
          quantity?: number | null
          unit_cost?: number | null
          received_date?: string | null
          expiry_date?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          item_id?: string | null
          batch_ref?: string | null
          quantity?: number | null
          unit_cost?: number | null
          received_date?: string | null
          expiry_date?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_batches_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_ledger: {
        Row: {
          id: string | null
          restaurant_id: string
          item_id: string
          entry_type: string
          quantity: number
          unit_cost: number | null
          total_cost: number | null
          reference_type: string | null
          reference_id: string | null
          note: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          item_id?: string | null
          entry_type?: string | null
          quantity?: number | null
          unit_cost?: number | null
          total_cost?: number | null
          reference_type?: string | null
          reference_id?: string | null
          note?: string | null
          created_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          item_id?: string | null
          entry_type?: string | null
          quantity?: number | null
          unit_cost?: number | null
          total_cost?: number | null
          reference_type?: string | null
          reference_id?: string | null
          note?: string | null
          created_by?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_ledger_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_created_by_fkey",
            columns: ["created_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_transfers: {
        Row: {
          id: string | null
          from_restaurant_id: string
          to_restaurant_id: string
          item_id: string
          quantity: number
          transferred_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          from_restaurant_id?: string | null
          to_restaurant_id?: string | null
          item_id?: string | null
          quantity?: number | null
          transferred_by?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          from_restaurant_id?: string | null
          to_restaurant_id?: string | null
          item_id?: string | null
          quantity?: number | null
          transferred_by?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transfers_from_restaurant_id_fkey",
            columns: ["from_restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_from_restaurant_id_fkey__locations",
            columns: ["from_restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_from_restaurant_id_fkey__locations",
            columns: ["from_restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_from_restaurant_id_fkey__locations",
            columns: ["from_restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_to_restaurant_id_fkey",
            columns: ["to_restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_to_restaurant_id_fkey__locations",
            columns: ["to_restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_to_restaurant_id_fkey__locations",
            columns: ["to_restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_to_restaurant_id_fkey__locations",
            columns: ["to_restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_transferred_by_fkey",
            columns: ["transferred_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_count_batches: {
        Row: {
          id: string | null
          restaurant_id: string
          counted_by: string | null
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          counted_by?: string | null
          notes?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          counted_by?: string | null
          notes?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_count_batches_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_batches_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_batches_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_batches_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_batches_counted_by_fkey",
            columns: ["counted_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_count_rows: {
        Row: {
          id: string | null
          batch_id: string
          item_id: string
          expected_qty: number
          actual_qty: number
          variance: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          batch_id?: string | null
          item_id?: string | null
          expected_qty?: number | null
          actual_qty?: number | null
          variance?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          batch_id?: string | null
          item_id?: string | null
          expected_qty?: number | null
          actual_qty?: number | null
          variance?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_count_rows_batch_id_fkey",
            columns: ["batch_id"],
            isOneToOne: false,
            referencedRelation: "inventory_count_batches",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_rows_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_rows_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_rows_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      waste_logs: {
        Row: {
          id: string | null
          restaurant_id: string
          item_id: string
          quantity: number
          reason: string
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          item_id?: string | null
          quantity?: number | null
          reason?: string | null
          recorded_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          item_id?: string | null
          quantity?: number | null
          reason?: string | null
          recorded_by?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waste_logs_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_recorded_by_fkey",
            columns: ["recorded_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      prep_production_logs: {
        Row: {
          id: string | null
          restaurant_id: string
          recipe_id: string
          quantity_produced: number
          produced_by: string | null
          notes: string | null
          production_date: string
          created_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          recipe_id?: string | null
          quantity_produced?: number | null
          produced_by?: string | null
          notes?: string | null
          production_date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          recipe_id?: string | null
          quantity_produced?: number | null
          produced_by?: string | null
          notes?: string | null
          production_date?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prep_production_logs_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_production_logs_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_production_logs_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_production_logs_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_production_logs_produced_by_fkey",
            columns: ["produced_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      recipes: {
        Row: {
          id: string | null
          tenant_id: string
          name: string
          description: string | null
          yield_qty: number
          yield_unit: string
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          name?: string | null
          description?: string | null
          yield_qty?: number | null
          yield_unit?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          name?: string | null
          description?: string | null
          yield_qty?: number | null
          yield_unit?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      recipe_ingredients: {
        Row: {
          id: string | null
          recipe_id: string
          item_id: string
          quantity: number
          unit: string
          waste_percent: number | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          recipe_id?: string | null
          item_id?: string | null
          quantity?: number | null
          unit?: string | null
          waste_percent?: number | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          recipe_id?: string | null
          item_id?: string | null
          quantity?: number | null
          unit?: string | null
          waste_percent?: number | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey",
            columns: ["recipe_id"],
            isOneToOne: false,
            referencedRelation: "recipes",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      menu_item_mappings: {
        Row: {
          id: string | null
          restaurant_id: string
          recipe_id: string
          menu_item_name: string
          menu_item_sku: string | null
          price: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          recipe_id?: string | null
          menu_item_name?: string | null
          menu_item_sku?: string | null
          price?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          recipe_id?: string | null
          menu_item_name?: string | null
          menu_item_sku?: string | null
          price?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_mappings_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_mappings_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_mappings_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_mappings_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_mappings_recipe_id_fkey",
            columns: ["recipe_id"],
            isOneToOne: false,
            referencedRelation: "recipes",
            referencedColumns: ["id"]
          }
        ]
      }
      sales_import_batches: {
        Row: {
          id: string | null
          restaurant_id: string
          filename: string
          total_rows: number
          processed_rows: number
          status: string
          errors: any | null
          imported_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          filename?: string | null
          total_rows?: number | null
          processed_rows?: number | null
          status?: string | null
          errors?: any | null
          imported_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          filename?: string | null
          total_rows?: number | null
          processed_rows?: number | null
          status?: string | null
          errors?: any | null
          imported_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_import_batches_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_import_batches_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_import_batches_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_import_batches_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_import_batches_imported_by_fkey",
            columns: ["imported_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      sales_import_rows: {
        Row: {
          id: string | null
          batch_id: string
          item_name: string
          category_name: string | null
          quantity: number
          unit: string | null
          total_price: number | null
          sale_date: string
          raw_data: any | null
          created_at: string
        }
        Insert: {
          id?: string | null
          batch_id?: string | null
          item_name?: string | null
          category_name?: string | null
          quantity?: number | null
          unit?: string | null
          total_price?: number | null
          sale_date?: string | null
          raw_data?: any | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          batch_id?: string | null
          item_name?: string | null
          category_name?: string | null
          quantity?: number | null
          unit?: string | null
          total_price?: number | null
          sale_date?: string | null
          raw_data?: any | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_import_rows_batch_id_fkey",
            columns: ["batch_id"],
            isOneToOne: false,
            referencedRelation: "sales_import_batches",
            referencedColumns: ["id"]
          }
        ]
      }
      daily_inventory_snapshots: {
        Row: {
          id: string | null
          restaurant_id: string
          item_id: string
          snapshot_date: string
          quantity_on_hand: number
          unit_cost: number | null
          total_value: number | null
          created_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          item_id?: string | null
          snapshot_date?: string | null
          quantity_on_hand?: number | null
          unit_cost?: number | null
          total_value?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          item_id?: string | null
          snapshot_date?: string | null
          quantity_on_hand?: number | null
          unit_cost?: number | null
          total_value?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_inventory_snapshots_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_inventory_snapshots_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_inventory_snapshots_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_inventory_snapshots_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_inventory_snapshots_item_id_fkey",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_inventory_snapshots_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_inventory_snapshots_item_id_fkey__inventory_items",
            columns: ["item_id"],
            isOneToOne: false,
            referencedRelation: "inventory_items",
            referencedColumns: ["id"]
          }
        ]
      }
      audit_log: {
        Row: {
          id: string | null
          tenant_id: string
          restaurant_id: string | null
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_value: any | null
          new_value: any | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          restaurant_id?: string | null
          user_id?: string | null
          action?: string | null
          entity_type?: string | null
          entity_id?: string | null
          old_value?: any | null
          new_value?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          restaurant_id?: string | null
          user_id?: string | null
          action?: string | null
          entity_type?: string | null
          entity_id?: string | null
          old_value?: any | null
          new_value?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      feature_flags: {
        Row: {
          id: string | null
          tenant_id: string
          flag_key: string
          flag_value: any
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          flag_key?: string | null
          flag_value?: any | null
          description?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          flag_key?: string | null
          flag_value?: any | null
          description?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_flags_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_flags_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_flags_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      app_users: {
        Row: {
          id: string | null
          tenant_id: string
          user_id: string
          role: string
          permissions: any | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          user_id?: string | null
          role?: string | null
          permissions?: any | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          user_id?: string | null
          role?: string | null
          permissions?: any | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_users_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_users_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_users_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_users_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_users_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      tenant_members: {
        Row: {
          id: string | null
          tenant_id: string
          user_id: string
          role: string
          is_active: boolean
          joined_at: string
          created_at: string
          updated_at: string
          email: string
          invited_at: string | null
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          user_id?: string | null
          role?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          email?: string | null
          invited_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          user_id?: string | null
          role?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          email?: string | null
          invited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_members_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_members_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_members_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_members_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_members_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      cached_recipes: {
        Row: {
          id: string | null
          tenant_id: string
          external_id: string
          name: string
          ingredients: any | null
          instructions: string | null
          source: string | null
          raw_data: any | null
          created_at: string
          updated_at: string
          menu_item_id: string | null
          menu_item_name: string | null
          selling_price: number | null
          is_active: boolean
          total_ingredient_cost: number | null
          food_cost_pct: number | null
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          external_id?: string | null
          name?: string | null
          ingredients?: any | null
          instructions?: string | null
          source?: string | null
          raw_data?: any | null
          created_at?: string | null
          updated_at?: string | null
          menu_item_id?: string | null
          menu_item_name?: string | null
          selling_price?: number | null
          is_active?: boolean | null
          total_ingredient_cost?: number | null
          food_cost_pct?: number | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          external_id?: string | null
          name?: string | null
          ingredients?: any | null
          instructions?: string | null
          source?: string | null
          raw_data?: any | null
          created_at?: string | null
          updated_at?: string | null
          menu_item_id?: string | null
          menu_item_name?: string | null
          selling_price?: number | null
          is_active?: boolean | null
          total_ingredient_cost?: number | null
          food_cost_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cached_recipes_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_recipes_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_recipes_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_recipes_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_recipes_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_recipes_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_recipes_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_recipes_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      pos_raw_imports: {
        Row: {
          id: string | null
          restaurant_id: string
          filename: string
          total_rows: number
          imported_rows: number
          failed_rows: number
          status: string
          error_log: any | null
          imported_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          restaurant_id?: string | null
          filename?: string | null
          total_rows?: number | null
          imported_rows?: number | null
          failed_rows?: number | null
          status?: string | null
          error_log?: any | null
          imported_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          restaurant_id?: string | null
          filename?: string | null
          total_rows?: number | null
          imported_rows?: number | null
          failed_rows?: number | null
          status?: string | null
          error_log?: any | null
          imported_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_raw_imports_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_raw_imports_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_raw_imports_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_raw_imports_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_raw_imports_imported_by_fkey",
            columns: ["imported_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      pos_batch_uploads: {
        Row: {
          id: string | null
          tenant_id: string
          restaurant_id: string
          filename: string
          status: string
          total_transactions: number
          processed_transactions: number
          failed_transactions: number
          error_details: any | null
          uploaded_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
          batch_id: string | null
          source: string | null
          total_receipts: number
          approved_rows: number
          quarantined_rows: number
          period_start: string | null
          period_end: string | null
          received_at: string | null
          processed_at: string | null
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          restaurant_id?: string | null
          filename?: string | null
          status?: string | null
          total_transactions?: number | null
          processed_transactions?: number | null
          failed_transactions?: number | null
          error_details?: any | null
          uploaded_by?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          batch_id?: string | null
          source?: string | null
          total_receipts?: number | null
          approved_rows?: number | null
          quarantined_rows?: number | null
          period_start?: string | null
          period_end?: string | null
          received_at?: string | null
          processed_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          restaurant_id?: string | null
          filename?: string | null
          status?: string | null
          total_transactions?: number | null
          processed_transactions?: number | null
          failed_transactions?: number | null
          error_details?: any | null
          uploaded_by?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          batch_id?: string | null
          source?: string | null
          total_receipts?: number | null
          approved_rows?: number | null
          quarantined_rows?: number | null
          period_start?: string | null
          period_end?: string | null
          received_at?: string | null
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_batch_uploads_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_batch_uploads_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_batch_uploads_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_batch_uploads_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_batch_uploads_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_batch_uploads_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_batch_uploads_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_batch_uploads_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_batch_uploads_uploaded_by_fkey",
            columns: ["uploaded_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      pos_transaction_staging: {
        Row: {
          id: string | null
          batch_id: string
          tenant_id: string
          restaurant_id: string
          transaction_date: string
          description: string | null
          amount: number
          currency: string
          category: string | null
          external_id: string | null
          raw_data: any | null
          flag: string
          notes: string | null
          created_at: string
          updated_at: string
          theoretical_grams: any | null
          recipe_found: boolean
        }
        Insert: {
          id?: string | null
          batch_id?: string | null
          tenant_id?: string | null
          restaurant_id?: string | null
          transaction_date?: string | null
          description?: string | null
          amount?: number | null
          currency?: string | null
          category?: string | null
          external_id?: string | null
          raw_data?: any | null
          flag?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          theoretical_grams?: any | null
          recipe_found?: boolean | null
        }
        Update: {
          id?: string | null
          batch_id?: string | null
          tenant_id?: string | null
          restaurant_id?: string | null
          transaction_date?: string | null
          description?: string | null
          amount?: number | null
          currency?: string | null
          category?: string | null
          external_id?: string | null
          raw_data?: any | null
          flag?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          theoretical_grams?: any | null
          recipe_found?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_transaction_staging_batch_id_fkey",
            columns: ["batch_id"],
            isOneToOne: false,
            referencedRelation: "pos_batch_uploads",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_staging_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_staging_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_staging_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_staging_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_staging_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_staging_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_staging_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_staging_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      pos_data_gaps: {
        Row: {
          id: string | null
          tenant_id: string
          restaurant_id: string
          gap_start: string
          gap_end: string
          reason: string | null
          is_resolved: boolean
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          restaurant_id?: string | null
          gap_start?: string | null
          gap_end?: string | null
          reason?: string | null
          is_resolved?: boolean | null
          resolved_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          restaurant_id?: string | null
          gap_start?: string | null
          gap_end?: string | null
          reason?: string | null
          is_resolved?: boolean | null
          resolved_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_data_gaps_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_data_gaps_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_data_gaps_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_data_gaps_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_data_gaps_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_data_gaps_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_data_gaps_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_data_gaps_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      purchases: {
        Row: {
          id: string | null
          tenant_id: string
          restaurant_id: string | null
          description: string
          amount: number
          currency: string
          category: string | null
          receipt_type: string | null
          receipt_url: string | null
          purchase_date: string
          vendor_name: string | null
          notes: string | null
          is_quarantined: boolean
          quarantine_status: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          total_amount: number | null
          invoice_number: string | null
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          restaurant_id?: string | null
          description?: string | null
          amount?: number | null
          currency?: string | null
          category?: string | null
          receipt_type?: string | null
          receipt_url?: string | null
          purchase_date?: string | null
          vendor_name?: string | null
          notes?: string | null
          is_quarantined?: boolean | null
          quarantine_status?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          total_amount?: number | null
          invoice_number?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          restaurant_id?: string | null
          description?: string | null
          amount?: number | null
          currency?: string | null
          category?: string | null
          receipt_type?: string | null
          receipt_url?: string | null
          purchase_date?: string | null
          vendor_name?: string | null
          notes?: string | null
          is_quarantined?: boolean | null
          quarantine_status?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          total_amount?: number | null
          invoice_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_created_by_fkey",
            columns: ["created_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_anomaly_queue: {
        Row: {
          id: string | null
          tenant_id: string
          purchase_id: string
          anomaly_type: string
          severity: string
          description: string | null
          metadata: any | null
          status: string
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          purchase_id?: string | null
          anomaly_type?: string | null
          severity?: string | null
          description?: string | null
          metadata?: any | null
          status?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          purchase_id?: string | null
          anomaly_type?: string | null
          severity?: string | null
          description?: string | null
          metadata?: any | null
          status?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_anomaly_queue_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_anomaly_queue_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_anomaly_queue_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_anomaly_queue_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_anomaly_queue_purchase_id_fkey",
            columns: ["purchase_id"],
            isOneToOne: false,
            referencedRelation: "purchases",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_anomaly_queue_reviewed_by_fkey",
            columns: ["reviewed_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      pending_text_followups: {
        Row: {
          id: string | null
          tenant_id: string
          outbox_id: string
          contact_phone: string
          followup_type: string
          context: any | null
          is_resolved: boolean
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          outbox_id?: string | null
          contact_phone?: string | null
          followup_type?: string | null
          context?: any | null
          is_resolved?: boolean | null
          resolved_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          outbox_id?: string | null
          contact_phone?: string | null
          followup_type?: string | null
          context?: any | null
          is_resolved?: boolean | null
          resolved_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_text_followups_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_text_followups_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_text_followups_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_text_followups_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      chart_of_accounts: {
        Row: {
          id: string | null
          tenant_id: string
          code: string
          name: string
          type: string
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          code?: string | null
          name?: string | null
          type?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          code?: string | null
          name?: string | null
          type?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_of_accounts_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_of_accounts_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_of_accounts_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string | null
          tenant_id: string
          account_id: string | null
          amount: number
          type: string
          description: string | null
          transaction_date: string
          reference_type: string | null
          reference_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          is_deleted: boolean
          location_id: string | null
          who: string | null
          category: string | null
          currency: string
          vat_detail: any | null
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          account_id?: string | null
          amount?: number | null
          type?: string | null
          description?: string | null
          transaction_date?: string | null
          reference_type?: string | null
          reference_id?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_deleted?: boolean | null
          location_id?: string | null
          who?: string | null
          category?: string | null
          currency?: string | null
          vat_detail?: any | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          account_id?: string | null
          amount?: number | null
          type?: string | null
          description?: string | null
          transaction_date?: string | null
          reference_type?: string | null
          reference_id?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_deleted?: boolean | null
          location_id?: string | null
          who?: string | null
          category?: string | null
          currency?: string | null
          vat_detail?: any | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_account_id_fkey",
            columns: ["account_id"],
            isOneToOne: false,
            referencedRelation: "chart_of_accounts",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_created_by_fkey",
            columns: ["created_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_location_id_fkey",
            columns: ["location_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_location_id_fkey__locations",
            columns: ["location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_location_id_fkey__locations",
            columns: ["location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_location_id_fkey__locations",
            columns: ["location_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string | null
          tenant_id: string
          invoice_number: string
          vendor_name: string | null
          total_amount: number
          currency: string
          invoice_date: string
          due_date: string | null
          status: string
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          invoice_number?: string | null
          vendor_name?: string | null
          total_amount?: number | null
          currency?: string | null
          invoice_date?: string | null
          due_date?: string | null
          status?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          invoice_number?: string | null
          vendor_name?: string | null
          total_amount?: number | null
          currency?: string | null
          invoice_date?: string | null
          due_date?: string | null
          status?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey",
            columns: ["created_by"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_items: {
        Row: {
          id: string | null
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          total_price: number | null
          created_at: string
        }
        Insert: {
          id?: string | null
          invoice_id?: string | null
          description?: string | null
          quantity?: number | null
          unit_price?: number | null
          total_price?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          invoice_id?: string | null
          description?: string | null
          quantity?: number | null
          unit_price?: number | null
          total_price?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey",
            columns: ["invoice_id"],
            isOneToOne: false,
            referencedRelation: "invoices",
            referencedColumns: ["id"]
          }
        ]
      }
      receipt_items: {
        Row: {
          id: string | null
          tenant_id: string
          purchase_id: string | null
          description: string
          quantity: number
          unit_price: number
          total_price: number
          category: string | null
          receipt_type: string | null
          receipt_image_url: string | null
          raw_ocr_data: any | null
          is_flagged: boolean
          created_at: string
          updated_at: string
          transaction_id: string | null
          item_name: string | null
          vat_rate: number | null
          source_type: string
          source_id: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          purchase_id?: string | null
          description?: string | null
          quantity?: number | null
          unit_price?: number | null
          total_price?: number | null
          category?: string | null
          receipt_type?: string | null
          receipt_image_url?: string | null
          raw_ocr_data?: any | null
          is_flagged?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          transaction_id?: string | null
          item_name?: string | null
          vat_rate?: number | null
          source_type?: string | null
          source_id?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          purchase_id?: string | null
          description?: string | null
          quantity?: number | null
          unit_price?: number | null
          total_price?: number | null
          category?: string | null
          receipt_type?: string | null
          receipt_image_url?: string | null
          raw_ocr_data?: any | null
          is_flagged?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          transaction_id?: string | null
          item_name?: string | null
          vat_rate?: number | null
          source_type?: string | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_items_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_purchase_id_fkey",
            columns: ["purchase_id"],
            isOneToOne: false,
            referencedRelation: "purchases",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_transaction_id_fkey",
            columns: ["transaction_id"],
            isOneToOne: false,
            referencedRelation: "transactions",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      whatsapp_inbox: {
        Row: {
          id: string | null
          tenant_id: string
          from_number: string
          message_type: string
          body: string | null
          media_url: string | null
          raw_payload: any | null
          status: string
          is_processed: boolean
          direction: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          from_number?: string | null
          message_type?: string | null
          body?: string | null
          media_url?: string | null
          raw_payload?: any | null
          status?: string | null
          is_processed?: boolean | null
          direction?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          from_number?: string | null
          message_type?: string | null
          body?: string | null
          media_url?: string | null
          raw_payload?: any | null
          status?: string | null
          is_processed?: boolean | null
          direction?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_inbox_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_inbox_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_inbox_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_inbox_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      whatsapp_outbox: {
        Row: {
          id: string | null
          tenant_id: string
          to_number: string
          message_type: string
          body: string | null
          media_url: string | null
          template_name: string | null
          template_data: any | null
          status: string
          priority: number
          payload: any | null
          sent_at: string | null
          delivered_at: string | null
          error_message: string | null
          created_at: string
          updated_at: string
          idempotency_key: string | null
          recipient_phone: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          to_number?: string | null
          message_type?: string | null
          body?: string | null
          media_url?: string | null
          template_name?: string | null
          template_data?: any | null
          status?: string | null
          priority?: number | null
          payload?: any | null
          sent_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
          idempotency_key?: string | null
          recipient_phone?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          to_number?: string | null
          message_type?: string | null
          body?: string | null
          media_url?: string | null
          template_name?: string | null
          template_data?: any | null
          status?: string | null
          priority?: number | null
          payload?: any | null
          sent_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
          idempotency_key?: string | null
          recipient_phone?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_outbox_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_outbox_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_outbox_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_outbox_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      graph_sync_queue: {
        Row: {
          id: string | null
          tenant_id: string
          entity_type: string
          entity_id: string
          operation: string
          status: string
          retry_count: number
          max_retries: number
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          entity_type?: string | null
          entity_id?: string | null
          operation?: string | null
          status?: string | null
          retry_count?: number | null
          max_retries?: number | null
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          entity_type?: string | null
          entity_id?: string | null
          operation?: string | null
          status?: string | null
          retry_count?: number | null
          max_retries?: number | null
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "graph_sync_queue_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graph_sync_queue_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graph_sync_queue_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graph_sync_queue_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      outbox_events: {
        Row: {
          id: string | null
          tenant_id: string
          event_type: string
          payload: any
          status: string
          created_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          event_type?: string | null
          payload?: any | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          event_type?: string | null
          payload?: any | null
          status?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outbox_events_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbox_events_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbox_events_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbox_events_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      api_keys: {
        Row: {
          id: string | null
          tenant_id: string
          name: string
          key_hash: string
          scopes: any | null
          is_active: boolean
          expires_at: string | null
          last_used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          name?: string | null
          key_hash?: string | null
          scopes?: any | null
          is_active?: boolean | null
          expires_at?: string | null
          last_used_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          name?: string | null
          key_hash?: string | null
          scopes?: any | null
          is_active?: boolean | null
          expires_at?: string | null
          last_used_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      rate_limits: {
        Row: {
          id: string | null
          tenant_id: string
          endpoint: string
          window_start: string
          request_count: number
          max_requests: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          endpoint?: string | null
          window_start?: string | null
          request_count?: number | null
          max_requests?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          endpoint?: string | null
          window_start?: string | null
          request_count?: number | null
          max_requests?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_limits_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_limits_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_limits_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_limits_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      system_telemetry: {
        Row: {
          id: string | null
          tenant_id: string
          event_type: string
          event_data: any | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          level: string | null
          component: string | null
          message: string | null
          metadata: any | null
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          event_type?: string | null
          event_data?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
          level?: string | null
          component?: string | null
          message?: string | null
          metadata?: any | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          event_type?: string | null
          event_data?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
          level?: string | null
          component?: string | null
          message?: string | null
          metadata?: any | null
        }
        Relationships: [
          {
            foreignKeyName: "system_telemetry_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_telemetry_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_telemetry_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_telemetry_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      tenants: {
        Row: {
          id: string | null
          name: string
          pin: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          handle: string | null
          categories: any
          config: any
        }
        Insert: {
          id?: string | null
          name?: string | null
          pin?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          handle?: string | null
          categories?: any | null
          config?: any | null
        }
        Update: {
          id?: string | null
          name?: string | null
          pin?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          handle?: string | null
          categories?: any | null
          config?: any | null
        }
        Relationships: [

        ]
      }
      locations: {
        Row: {
          id: string | null
          franchise_group_id: string
          name: string
          timezone: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          address: string | null
        }
        Insert: {
          id?: string | null
          franchise_group_id?: string | null
          name?: string | null
          timezone?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          address?: string | null
        }
        Update: {
          id?: string | null
          franchise_group_id?: string | null
          name?: string | null
          timezone?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_franchise_group_id_fkey",
            columns: ["franchise_group_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_franchise_group_id_fkey__tenants",
            columns: ["franchise_group_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_franchise_group_id_fkey__tenants",
            columns: ["franchise_group_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_franchise_group_id_fkey__tenants",
            columns: ["franchise_group_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_categories: {
        Row: {
          id: string | null
          tenant_id: string
          name: string
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
          item_type: string | null
          category_group: string | null
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          name?: string | null
          description?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          item_type?: string | null
          category_group?: string | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          name?: string | null
          description?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          item_type?: string | null
          category_group?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_categories_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_categories_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_categories_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_categories_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_items: {
        Row: {
          id: string | null
          tenant_id: string
          category_id: string
          name: string
          sku: string | null
          barcode: string | null
          unit: string
          unit_price: number | null
          par_level: number | null
          reorder_point: number | null
          stock_on_hand: number
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
          type: string
          purchasing_uom: string
          inventory_uom: string
          recipe_uom: string | null
          inv_to_recipe_ratio: number | null
          allergen_info: string | null
          supplier_sku: string | null
          unit_cost: number | null
          restaurant_id: string | null
          conversion_factor: number
        }
        Insert: {
          id?: string | null
          tenant_id?: string | null
          category_id?: string | null
          name?: string | null
          sku?: string | null
          barcode?: string | null
          unit?: string | null
          unit_price?: number | null
          par_level?: number | null
          reorder_point?: number | null
          stock_on_hand?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          type?: string | null
          purchasing_uom?: string | null
          inventory_uom?: string | null
          recipe_uom?: string | null
          inv_to_recipe_ratio?: number | null
          allergen_info?: string | null
          supplier_sku?: string | null
          unit_cost?: number | null
          restaurant_id?: string | null
          conversion_factor?: number | null
        }
        Update: {
          id?: string | null
          tenant_id?: string | null
          category_id?: string | null
          name?: string | null
          sku?: string | null
          barcode?: string | null
          unit?: string | null
          unit_price?: number | null
          par_level?: number | null
          reorder_point?: number | null
          stock_on_hand?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          type?: string | null
          purchasing_uom?: string | null
          inventory_uom?: string | null
          recipe_uom?: string | null
          inv_to_recipe_ratio?: number | null
          allergen_info?: string | null
          supplier_sku?: string | null
          unit_cost?: number | null
          restaurant_id?: string | null
          conversion_factor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_tenant_id_fkey",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "franchise_groups",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey__tenants",
            columns: ["tenant_id"],
            isOneToOne: false,
            referencedRelation: "tenants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_category_id_fkey",
            columns: ["category_id"],
            isOneToOne: false,
            referencedRelation: "item_categories",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_category_id_fkey__inventory_categories",
            columns: ["category_id"],
            isOneToOne: false,
            referencedRelation: "inventory_categories",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_category_id_fkey__inventory_categories",
            columns: ["category_id"],
            isOneToOne: false,
            referencedRelation: "inventory_categories",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_restaurant_id_fkey",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "restaurants",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_restaurant_id_fkey__locations",
            columns: ["restaurant_id"],
            isOneToOne: false,
            referencedRelation: "locations",
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type CompositeTypes<T extends keyof Database['public']['CompositeTypes']> = Database['public']['CompositeTypes'][T];
