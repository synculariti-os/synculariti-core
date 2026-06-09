export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  ims: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          error_message: string | null
          franchise_group_id: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          restaurant_id: string | null
          source_ip: string | null
          success: boolean
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          error_message?: string | null
          franchise_group_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          restaurant_id?: string | null
          source_ip?: string | null
          success: boolean
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          franchise_group_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          restaurant_id?: string | null
          source_ip?: string | null
          success?: boolean
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_franchise_group_id_fkey"
            columns: ["franchise_group_id"]
            isOneToOne: false
            referencedRelation: "franchise_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          franchise_group_id: string | null
          id: string
          name: string
          restaurant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          franchise_group_id?: string | null
          id?: string
          name: string
          restaurant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          franchise_group_id?: string | null
          id?: string
          name?: string
          restaurant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_franchise_group_id_fkey"
            columns: ["franchise_group_id"]
            isOneToOne: false
            referencedRelation: "franchise_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_inventory_snapshots: {
        Row: {
          business_date: string
          created_at: string
          eod_qty: number
          fifo_total_value: number
          id: string
          item_id: string
          restaurant_id: string
        }
        Insert: {
          business_date: string
          created_at?: string
          eod_qty?: number
          fifo_total_value?: number
          id?: string
          item_id: string
          restaurant_id: string
        }
        Update: {
          business_date?: string
          created_at?: string
          eod_qty?: number
          fifo_total_value?: number
          id?: string
          item_id?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_inventory_snapshots_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_inventory_snapshots_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_groups: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_batches: {
        Row: {
          created_at: string
          id: string
          initial_qty: number
          item_id: string
          landed_unit_cost: number
          po_id: string | null
          received_date: string
          remaining_qty: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          initial_qty: number
          item_id: string
          landed_unit_cost: number
          po_id?: string | null
          received_date?: string
          remaining_qty: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          initial_qty?: number
          item_id?: string
          landed_unit_cost?: number
          po_id?: string | null
          received_date?: string
          remaining_qty?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_batches_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_count_batches: {
        Row: {
          created_at: string
          id: string
          restaurant_id: string
          snapshot_timestamp: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          restaurant_id: string
          snapshot_timestamp?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          restaurant_id?: string
          snapshot_timestamp?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_count_batches_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_count_rows: {
        Row: {
          actual_qty: number | null
          batch_id: string
          created_at: string
          expected_qty: number
          id: string
          item_id: string
          updated_at: string
          variance_qty: number | null
        }
        Insert: {
          actual_qty?: number | null
          batch_id: string
          created_at?: string
          expected_qty: number
          id?: string
          item_id: string
          updated_at?: string
          variance_qty?: number | null
        }
        Update: {
          actual_qty?: number | null
          batch_id?: string
          created_at?: string
          expected_qty?: number
          id?: string
          item_id?: string
          updated_at?: string
          variance_qty?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_count_rows_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "inventory_count_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_rows_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_ledger: {
        Row: {
          change_amount: number
          created_at: string
          id: string
          item_id: string
          reason_code: string
          reference_id: string | null
          restaurant_id: string
        }
        Insert: {
          change_amount: number
          created_at?: string
          id?: string
          item_id: string
          reason_code: string
          reference_id?: string | null
          restaurant_id: string
        }
        Update: {
          change_amount?: number
          created_at?: string
          id?: string
          item_id?: string
          reason_code?: string
          reference_id?: string | null
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_ledger_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transfers: {
        Row: {
          created_at: string
          destination_restaurant_id: string
          franchise_group_id: string
          id: string
          item_id: string
          origin_restaurant_id: string
          qty: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination_restaurant_id: string
          franchise_group_id: string
          id?: string
          item_id: string
          origin_restaurant_id: string
          qty: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination_restaurant_id?: string
          franchise_group_id?: string
          id?: string
          item_id?: string
          origin_restaurant_id?: string
          qty?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transfers_destination_restaurant_id_fkey"
            columns: ["destination_restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_franchise_group_id_fkey"
            columns: ["franchise_group_id"]
            isOneToOne: false
            referencedRelation: "franchise_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_origin_restaurant_id_fkey"
            columns: ["origin_restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      item_restaurant_overrides: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          item_id: string
          par_level: number | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          item_id: string
          par_level?: number | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          item_id?: string
          par_level?: number | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_restaurant_overrides_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_restaurant_overrides_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          category_id: string
          created_at: string
          deleted_at: string | null
          franchise_group_id: string | null
          id: string
          inv_to_recipe_ratio: number
          inventory_uom: string
          is_active: boolean
          name: string
          purchasing_uom: string
          recipe_uom: string | null
          restaurant_id: string | null
          sku: string
          type: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          deleted_at?: string | null
          franchise_group_id?: string | null
          id?: string
          inv_to_recipe_ratio?: number
          inventory_uom: string
          is_active?: boolean
          name: string
          purchasing_uom: string
          recipe_uom?: string | null
          restaurant_id?: string | null
          sku: string
          type: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          deleted_at?: string | null
          franchise_group_id?: string | null
          id?: string
          inv_to_recipe_ratio?: number
          inventory_uom?: string
          is_active?: boolean
          name?: string
          purchasing_uom?: string
          recipe_uom?: string | null
          restaurant_id?: string | null
          sku?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_franchise_group_id_fkey"
            columns: ["franchise_group_id"]
            isOneToOne: false
            referencedRelation: "franchise_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_mappings: {
        Row: {
          created_at: string
          id: string
          raw_excel_string: string
          recipe_id: string
          restaurant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          raw_excel_string: string
          recipe_id: string
          restaurant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          raw_excel_string?: string
          recipe_id?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_mappings_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_mappings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      po_line_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          po_id: string
          quantity_ordered: number
          quantity_received: number | null
          raw_unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          po_id: string
          quantity_ordered: number
          quantity_received?: number | null
          raw_unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          po_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          raw_unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "po_line_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_line_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      prep_production_logs: {
        Row: {
          created_at: string
          id: string
          prep_item_id: string
          produced_at: string
          restaurant_id: string
          yield_qty_produced: number
        }
        Insert: {
          created_at?: string
          id?: string
          prep_item_id: string
          produced_at?: string
          restaurant_id: string
          yield_qty_produced: number
        }
        Update: {
          created_at?: string
          id?: string
          prep_item_id?: string
          produced_at?: string
          restaurant_id?: string
          yield_qty_produced?: number
        }
        Relationships: [
          {
            foreignKeyName: "prep_production_logs_prep_item_id_fkey"
            columns: ["prep_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_production_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          deleted_at: string | null
          discount_amount: number | null
          expected_delivery_date: string | null
          freight_charge: number | null
          id: string
          order_date: string
          restaurant_id: string
          status: string
          tax_amount: number | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          discount_amount?: number | null
          expected_delivery_date?: string | null
          freight_charge?: number | null
          id?: string
          order_date?: string
          restaurant_id: string
          status?: string
          tax_amount?: number | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          discount_amount?: number | null
          expected_delivery_date?: string | null
          freight_charge?: number | null
          id?: string
          order_date?: string
          restaurant_id?: string
          status?: string
          tax_amount?: number | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_item_id: string | null
          quantity_required: number
          recipe_id: string
          sub_recipe_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_item_id?: string | null
          quantity_required: number
          recipe_id: string
          sub_recipe_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_item_id?: string | null
          quantity_required?: number
          recipe_id?: string
          sub_recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_item_id_fkey"
            columns: ["ingredient_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_sub_recipe_id_fkey"
            columns: ["sub_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          deleted_at: string | null
          franchise_group_id: string | null
          id: string
          produces_item_id: string | null
          recipe_name: string | null
          restaurant_id: string | null
          updated_at: string
          yield_quantity: number
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          franchise_group_id?: string | null
          id?: string
          produces_item_id?: string | null
          recipe_name?: string | null
          restaurant_id?: string | null
          updated_at?: string
          yield_quantity: number
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          franchise_group_id?: string | null
          id?: string
          produces_item_id?: string | null
          recipe_name?: string | null
          restaurant_id?: string | null
          updated_at?: string
          yield_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipes_franchise_group_id_fkey"
            columns: ["franchise_group_id"]
            isOneToOne: false
            referencedRelation: "franchise_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_produces_item_id_fkey"
            columns: ["produces_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          created_at: string
          deleted_at: string | null
          franchise_group_id: string
          id: string
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          franchise_group_id: string
          id?: string
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          franchise_group_id?: string
          id?: string
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_franchise_group_id_fkey"
            columns: ["franchise_group_id"]
            isOneToOne: false
            referencedRelation: "franchise_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales_import_batches: {
        Row: {
          business_date: string | null
          created_at: string
          error_message: string | null
          id: string
          restaurant_id: string
          status: string
          updated_at: string
        }
        Insert: {
          business_date?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          restaurant_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_date?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          restaurant_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_import_batches_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_import_rows: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          is_mapped: boolean
          quantity_sold: number
          raw_item_name: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          is_mapped?: boolean
          quantity_sold: number
          raw_item_name: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          is_mapped?: boolean
          quantity_sold?: number
          raw_item_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_import_rows_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "sales_import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      uom_conversions: {
        Row: {
          created_at: string
          deleted_at: string | null
          from_uom: string
          id: string
          item_id: string
          multiplier_factor: number
          to_uom: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          from_uom: string
          id?: string
          item_id: string
          multiplier_factor: number
          to_uom: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          from_uom?: string
          id?: string
          item_id?: string
          multiplier_factor?: number
          to_uom?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "uom_conversions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_restaurant_roles: {
        Row: {
          created_at: string
          id: string
          restaurant_id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          restaurant_id: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          restaurant_id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_restaurant_roles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restaurant_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restaurant_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string
          id: string
          last_login_at: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          email: string
          full_name: string
          id: string
          last_login_at?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name?: string
          id?: string
          last_login_at?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          contact_email: string | null
          created_at: string
          deleted_at: string | null
          franchise_group_id: string | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          deleted_at?: string | null
          franchise_group_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          deleted_at?: string | null
          franchise_group_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_franchise_group_id_fkey"
            columns: ["franchise_group_id"]
            isOneToOne: false
            referencedRelation: "franchise_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_logs: {
        Row: {
          created_at: string
          id: string
          item_id: string
          quantity: number
          reason: string | null
          recorded_at: string
          restaurant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          quantity: number
          reason?: string | null
          recorded_at?: string
          restaurant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          quantity?: number
          reason?: string | null
          recorded_at?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_logs_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_tenant_context: {
        Args: { p_franchise_group_id: string; p_restaurant_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor_name: string | null
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          tenant_id: string
        }
        Insert: {
          action: string
          actor_name?: string | null
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          tenant_id: string
        }
        Update: {
          action?: string
          actor_name?: string | null
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_household_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key_value: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key_value: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key_value?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      app_users: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_users_household_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cached_ingredients: {
        Row: {
          base_unit: string | null
          canonical_name: string
          category: string | null
          cost_per_gram: number | null
          current_stock_grams: number | null
          fetched_at: string
          id: string
          ingredient_id: string
          perishability_days: number | null
          tenant_id: string
        }
        Insert: {
          base_unit?: string | null
          canonical_name: string
          category?: string | null
          cost_per_gram?: number | null
          current_stock_grams?: number | null
          fetched_at?: string
          id?: string
          ingredient_id: string
          perishability_days?: number | null
          tenant_id: string
        }
        Update: {
          base_unit?: string | null
          canonical_name?: string
          category?: string | null
          cost_per_gram?: number | null
          current_stock_grams?: number | null
          fetched_at?: string
          id?: string
          ingredient_id?: string
          perishability_days?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cached_ingredients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cached_recipes: {
        Row: {
          fetched_at: string
          food_cost_pct: number | null
          id: string
          ingredients: Json
          is_active: boolean | null
          menu_item_id: string
          menu_item_name: string
          selling_price: number | null
          tenant_id: string
          total_ingredient_cost: number | null
        }
        Insert: {
          fetched_at?: string
          food_cost_pct?: number | null
          id?: string
          ingredients: Json
          is_active?: boolean | null
          menu_item_id: string
          menu_item_name: string
          selling_price?: number | null
          tenant_id: string
          total_ingredient_cost?: number | null
        }
        Update: {
          fetched_at?: string
          food_cost_pct?: number | null
          id?: string
          ingredients?: Json
          is_active?: boolean | null
          menu_item_id?: string
          menu_item_name?: string
          selling_price?: number | null
          tenant_id?: string
          total_ingredient_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cached_recipes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          created_at: string | null
          id: string
          tenant_id: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          created_at?: string | null
          id?: string
          tenant_id: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          created_at?: string | null
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      et_inventory_ledger: {
        Row: {
          change_amount: number
          created_at: string | null
          id: string
          item_id: string
          location_id: string | null
          reason: string
          reference_id: string | null
          tenant_id: string
        }
        Insert: {
          change_amount: number
          created_at?: string | null
          id?: string
          item_id: string
          location_id?: string | null
          reason: string
          reference_id?: string | null
          tenant_id: string
        }
        Update: {
          change_amount?: number
          created_at?: string | null
          id?: string
          item_id?: string
          location_id?: string | null
          reason?: string
          reference_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_ledger_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      et_po_line_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          po_id: string
          quantity_ordered: number
          quantity_received: number
          tenant_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          po_id: string
          quantity_ordered: number
          quantity_received?: number
          tenant_id: string
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          po_id?: string
          quantity_ordered?: number
          quantity_received?: number
          tenant_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "po_line_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_line_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "et_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_line_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      et_purchase_orders: {
        Row: {
          created_at: string | null
          currency: string
          id: string
          location_id: string | null
          order_date: string | null
          status: string
          tenant_id: string
          total_amount: number
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          id?: string
          location_id?: string | null
          order_date?: string | null
          status?: string
          tenant_id: string
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          id?: string
          location_id?: string | null
          order_date?: string | null
          status?: string
          tenant_id?: string
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_log: {
        Row: {
          action: string
          actor_name: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          tenant_id: string
          who_id: string | null
        }
        Insert: {
          action: string
          actor_name?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          tenant_id: string
          who_id?: string | null
        }
        Update: {
          action?: string
          actor_name?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          tenant_id?: string
          who_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      graph_sync_queue: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          last_error: string | null
          max_retries: number | null
          operation: string
          payload: Json | null
          processed_at: string | null
          retry_count: number | null
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          last_error?: string | null
          max_retries?: number | null
          operation: string
          payload?: Json | null
          processed_at?: string | null
          retry_count?: number | null
          status?: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          last_error?: string | null
          max_retries?: number | null
          operation?: string
          payload?: Json | null
          processed_at?: string | null
          retry_count?: number | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "graph_sync_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category_id: string | null
          conversion_factor: number
          created_at: string | null
          id: string
          inventory_uom: string
          is_active: boolean | null
          name: string
          purchasing_uom: string
          sku: string
          tenant_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          conversion_factor?: number
          created_at?: string | null
          id?: string
          inventory_uom: string
          is_active?: boolean | null
          name: string
          purchasing_uom: string
          sku: string
          tenant_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          conversion_factor?: number
          created_at?: string | null
          id?: string
          inventory_uom?: string
          is_active?: boolean | null
          name?: string
          purchasing_uom?: string
          sku?: string
          tenant_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          account_id: string | null
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          tax_rate: number | null
          tenant_id: string
          unit_price: number
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          line_total: number
          quantity?: number
          tax_rate?: number | null
          tenant_id: string
          unit_price: number
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          tax_rate?: number | null
          tenant_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          currency: string
          due_date: string | null
          id: string
          invoice_number: string | null
          location_id: string | null
          raw_file_url: string | null
          status: string
          tenant_id: string
          total_amount: number
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          location_id?: string | null
          raw_file_url?: string | null
          status?: string
          tenant_id: string
          total_amount: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          location_id?: string | null
          raw_file_url?: string | null
          status?: string
          tenant_id?: string
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_household_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      outbox_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outbox_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_text_followups: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          expires_at: string
          id: string
          outbox_id: string
          prompt: string
          responded_at: string | null
          response: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          expires_at: string
          id?: string
          outbox_id: string
          prompt: string
          responded_at?: string | null
          response?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          expires_at?: string
          id?: string
          outbox_id?: string
          prompt?: string
          responded_at?: string | null
          response?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_text_followups_outbox_id_fkey"
            columns: ["outbox_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_outbox"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_text_followups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_batch_uploads: {
        Row: {
          approved_rows: number
          batch_id: string | null
          error_detail: Json | null
          id: string
          location_id: string
          period_end: string | null
          period_start: string | null
          processed_at: string | null
          quarantined_rows: number
          received_at: string
          source: string | null
          status: string
          tenant_id: string
          total_receipts: number
        }
        Insert: {
          approved_rows?: number
          batch_id?: string | null
          error_detail?: Json | null
          id?: string
          location_id: string
          period_end?: string | null
          period_start?: string | null
          processed_at?: string | null
          quarantined_rows?: number
          received_at?: string
          source?: string | null
          status?: string
          tenant_id: string
          total_receipts?: number
        }
        Update: {
          approved_rows?: number
          batch_id?: string | null
          error_detail?: Json | null
          id?: string
          location_id?: string
          period_end?: string | null
          period_start?: string | null
          processed_at?: string | null
          quarantined_rows?: number
          received_at?: string
          source?: string | null
          status?: string
          tenant_id?: string
          total_receipts?: number
        }
        Relationships: [
          {
            foreignKeyName: "pos_batch_uploads_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_batch_uploads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_data_gaps: {
        Row: {
          gap_date: string
          id: string
          location_id: string
          notified_at: string | null
          resolved_at: string | null
          tenant_id: string
        }
        Insert: {
          gap_date: string
          id?: string
          location_id: string
          notified_at?: string | null
          resolved_at?: string | null
          tenant_id: string
        }
        Update: {
          gap_date?: string
          id?: string
          location_id?: string
          notified_at?: string | null
          resolved_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_data_gaps_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_data_gaps_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_transaction_staging: {
        Row: {
          anomaly_reason: string | null
          anomaly_score: number | null
          batch_id: string
          created_at: string
          flag: string
          id: string
          is_comp: boolean | null
          is_void: boolean | null
          item_name: string | null
          item_sku: string | null
          line_number: number
          location_id: string
          quantity: number | null
          raw_payload: Json
          receipt_number: string | null
          recipe_found: boolean | null
          revenue: number | null
          tenant_id: string
          theoretical_grams: Json | null
          transaction_time: string
        }
        Insert: {
          anomaly_reason?: string | null
          anomaly_score?: number | null
          batch_id: string
          created_at?: string
          flag?: string
          id?: string
          is_comp?: boolean | null
          is_void?: boolean | null
          item_name?: string | null
          item_sku?: string | null
          line_number: number
          location_id: string
          quantity?: number | null
          raw_payload: Json
          receipt_number?: string | null
          recipe_found?: boolean | null
          revenue?: number | null
          tenant_id: string
          theoretical_grams?: Json | null
          transaction_time: string
        }
        Update: {
          anomaly_reason?: string | null
          anomaly_score?: number | null
          batch_id?: string
          created_at?: string
          flag?: string
          id?: string
          is_comp?: boolean | null
          is_void?: boolean | null
          item_name?: string | null
          item_sku?: string | null
          line_number?: number
          location_id?: string
          quantity?: number | null
          raw_payload?: Json
          receipt_number?: string | null
          recipe_found?: boolean | null
          revenue?: number | null
          tenant_id?: string
          theoretical_grams?: Json | null
          transaction_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_transaction_staging_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "pos_batch_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_staging_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "v_quarantine_audit"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "pos_transaction_staging_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_staging_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_anomaly_queue: {
        Row: {
          anomaly_detail: string | null
          anomaly_score: number | null
          check_type: string
          created_at: string
          id: string
          location_id: string
          notification_sent_at: string | null
          outbox_id: string | null
          purchase_id: string
          receipt_item_id: string | null
          response_decision: string | null
          response_received_at: string | null
          severity: string
          status: string
          tenant_id: string
        }
        Insert: {
          anomaly_detail?: string | null
          anomaly_score?: number | null
          check_type: string
          created_at?: string
          id?: string
          location_id: string
          notification_sent_at?: string | null
          outbox_id?: string | null
          purchase_id: string
          receipt_item_id?: string | null
          response_decision?: string | null
          response_received_at?: string | null
          severity?: string
          status?: string
          tenant_id: string
        }
        Update: {
          anomaly_detail?: string | null
          anomaly_score?: number | null
          check_type?: string
          created_at?: string
          id?: string
          location_id?: string
          notification_sent_at?: string | null
          outbox_id?: string | null
          purchase_id?: string
          receipt_item_id?: string | null
          response_decision?: string | null
          response_received_at?: string | null
          severity?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_anomaly_queue_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_anomaly_queue_outbox_id_fkey"
            columns: ["outbox_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_outbox"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_anomaly_queue_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_anomaly_queue_receipt_item_id_fkey"
            columns: ["receipt_item_id"]
            isOneToOne: false
            referencedRelation: "receipt_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_anomaly_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          account_id: string
          created_at: string
          currency: string
          id: string
          ingredient_id: string | null
          ingredient_name: string | null
          invoice_number: string | null
          location_id: string
          purchase_date: string
          quarantine_status: string
          receipt_hash: string | null
          receipt_type: string
          rejection_note: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_image_url: string | null
          tax_amount: number | null
          tax_rate: number | null
          tenant_id: string
          total_amount: number
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          currency?: string
          id?: string
          ingredient_id?: string | null
          ingredient_name?: string | null
          invoice_number?: string | null
          location_id: string
          purchase_date: string
          quarantine_status?: string
          receipt_hash?: string | null
          receipt_type?: string
          rejection_note?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_image_url?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          tenant_id: string
          total_amount: number
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          currency?: string
          id?: string
          ingredient_id?: string | null
          ingredient_name?: string | null
          invoice_number?: string | null
          location_id?: string
          purchase_date?: string
          quarantine_status?: string
          receipt_hash?: string | null
          receipt_type?: string
          rejection_note?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_image_url?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          tenant_id?: string
          total_amount?: number
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action_type: string
          attempt_count: number | null
          blocked_until: string | null
          ip_hash: string
          window_start: string | null
        }
        Insert: {
          action_type?: string
          attempt_count?: number | null
          blocked_until?: string | null
          ip_hash: string
          window_start?: string | null
        }
        Update: {
          action_type?: string
          attempt_count?: number | null
          blocked_until?: string | null
          ip_hash?: string
          window_start?: string | null
        }
        Relationships: []
      }
      receipt_items: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          currency: string
          id: string
          name: string
          source_id: string
          source_type: string
          tenant_id: string
          transaction_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          currency?: string
          id?: string
          name: string
          source_id: string
          source_type: string
          tenant_id: string
          transaction_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          currency?: string
          id?: string
          name?: string
          source_id?: string
          source_type?: string
          tenant_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipt_items_household_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      system_telemetry: {
        Row: {
          component: string
          created_at: string | null
          id: string
          level: string
          message: string
          metadata: Json | null
          tenant_id: string | null
        }
        Insert: {
          component: string
          created_at?: string | null
          id?: string
          level: string
          message: string
          metadata?: Json | null
          tenant_id?: string | null
        }
        Update: {
          component?: string
          created_at?: string | null
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_telemetry_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          role?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          categories: Json | null
          config: Json | null
          created_at: string | null
          handle: string | null
          id: string
          name: string
          total_budget: number | null
          updated_at: string | null
        }
        Insert: {
          categories?: Json | null
          config?: Json | null
          created_at?: string | null
          handle?: string | null
          id?: string
          name: string
          total_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          categories?: Json | null
          config?: Json | null
          created_at?: string | null
          handle?: string | null
          id?: string
          name?: string
          total_budget?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          created_at: string | null
          currency: string
          date: string
          description: string | null
          ico: string | null
          id: string
          invoice_id: string | null
          is_deleted: boolean | null
          location_id: string | null
          receipt_number: string | null
          tenant_id: string
          transacted_at: string | null
          transaction_type: string | null
          updated_at: string | null
          vat_detail: Json | null
          who: string | null
          who_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: string
          created_at?: string | null
          currency?: string
          date?: string
          description?: string | null
          ico?: string | null
          id?: string
          invoice_id?: string | null
          is_deleted?: boolean | null
          location_id?: string | null
          receipt_number?: string | null
          tenant_id: string
          transacted_at?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vat_detail?: Json | null
          who?: string | null
          who_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          created_at?: string | null
          currency?: string
          date?: string
          description?: string | null
          ico?: string | null
          id?: string
          invoice_id?: string | null
          is_deleted?: boolean | null
          location_id?: string | null
          receipt_number?: string | null
          tenant_id?: string
          transacted_at?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vat_detail?: Json | null
          who?: string | null
          who_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_household_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_inbox: {
        Row: {
          content: string
          created_at: string
          id: string
          message_id: string
          message_type: string
          outbox_id: string | null
          sender_phone: string
          tenant_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_id: string
          message_type: string
          outbox_id?: string | null
          sender_phone: string
          tenant_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_id?: string
          message_type?: string
          outbox_id?: string | null
          sender_phone?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_inbox_outbox_id_fkey"
            columns: ["outbox_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_outbox"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_inbox_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_outbox: {
        Row: {
          api_key_id: string | null
          created_at: string
          id: string
          idempotency_key: string | null
          payload: Json
          processed_at: string | null
          recipient_email: string | null
          recipient_phone: string
          retry_count: number | null
          status: string
          tenant_id: string
          webhook_secret: string | null
          webhook_url: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string | null
          payload: Json
          processed_at?: string | null
          recipient_email?: string | null
          recipient_phone: string
          retry_count?: number | null
          status?: string
          tenant_id: string
          webhook_secret?: string | null
          webhook_url?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string | null
          payload?: Json
          processed_at?: string | null
          recipient_email?: string | null
          recipient_phone?: string
          retry_count?: number | null
          status?: string
          tenant_id?: string
          webhook_secret?: string | null
          webhook_url?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_outbox_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_outbox_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      current_inventory: {
        Row: {
          item_id: string | null
          last_movement: string | null
          location_id: string | null
          stock_level: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_ledger_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_quarantine_audit: {
        Row: {
          anomaly_reason: string | null
          anomaly_score: number | null
          batch_id: string | null
          ims_batch_id: string | null
          item_name: string | null
          item_sku: string | null
          line_number: number | null
          quantity: number | null
          received_at: string | null
          revenue: number | null
          transaction_time: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_transaction_v3: { Args: { p_transaction: Json }; Returns: string }
      add_transactions_bulk_v1: {
        Args: { p_transactions: Json }
        Returns: string[]
      }
      approve_purchase_v1: {
        Args: { p_purchase_id: string; p_queue_id: string }
        Returns: undefined
      }
      check_default_privileges_v1: {
        Args: never
        Returns: {
          anon_default_insert: boolean
        }[]
      }
      check_rate_limit: {
        Args: {
          p_action: string
          p_block_minutes?: number
          p_ip_hash: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      check_tenant_pin: {
        Args: { h_id: string; input_pin: string }
        Returns: boolean
      }
      claim_whatsapp_outbox_batch: {
        Args: { p_batch_size?: number }
        Returns: {
          api_key_id: string | null
          created_at: string
          id: string
          idempotency_key: string | null
          payload: Json
          processed_at: string | null
          recipient_email: string | null
          recipient_phone: string
          retry_count: number | null
          status: string
          tenant_id: string
          webhook_secret: string | null
          webhook_url: string | null
          whatsapp_message_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "whatsapp_outbox"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      complete_graph_sync_batch_v1: {
        Args: { p_ids: string[] }
        Returns: undefined
      }
      complete_whatsapp_action_v1: {
        Args: { p_decision: string; p_outbox_id: string }
        Returns: {
          payload: Json
          status: string
          webhook_secret: string
          webhook_url: string
        }[]
      }
      create_inventory_item_v1: { Args: { p_item: Json }; Returns: string }
      create_organization: {
        Args: { p_handle: string; p_name: string }
        Returns: string
      }
      enqueue_graph_sync_internal: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_operation: string
          p_payload?: Json
          p_tenant_id: string
        }
        Returns: undefined
      }
      get_function_security_state: {
        Args: { p_args_signature: string; p_func_name: string }
        Returns: {
          func_exists: boolean
          has_search_path_public: boolean
          is_revoked_from_public: boolean
        }[]
      }
      get_index_exists: {
        Args: { p_index: string; p_table: string }
        Returns: boolean
      }
      get_my_available_tenants: {
        Args: never
        Returns: {
          tenant_handle: string
          tenant_id: string
          tenant_name: string
          user_role: string
        }[]
      }
      get_my_tenant: { Args: never; Returns: string }
      get_pending_approvals_v1: {
        Args: never
        Returns: {
          created_at: string
          id: string
          payload: Json
          recipient_email: string
          recipient_phone: string
          status: string
          tenant_id: string
        }[]
      }
      get_table_privilege_state_v1: {
        Args: { p_table_name: string }
        Returns: {
          anon_has_delete: boolean
          anon_has_insert: boolean
          anon_has_references: boolean
          anon_has_select: boolean
          anon_has_trigger: boolean
          anon_has_update: boolean
          rls_enabled: boolean
        }[]
      }
      get_table_rls_status: { Args: { p_table: string }; Returns: boolean }
      get_tenant_bundle: { Args: never; Returns: Json }
      insert_whatsapp_outbox_v2: {
        Args: {
          p_api_key_id?: string
          p_idempotency_key?: string
          p_payload: Json
          p_recipient_email?: string
          p_recipient_phone: string
          p_tenant_id: string
          p_webhook_secret?: string
          p_webhook_url?: string
        }
        Returns: {
          api_key_id: string | null
          created_at: string
          id: string
          idempotency_key: string | null
          payload: Json
          processed_at: string | null
          recipient_email: string | null
          recipient_phone: string
          retry_count: number | null
          status: string
          tenant_id: string
          webhook_secret: string | null
          webhook_url: string | null
          whatsapp_message_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "whatsapp_outbox"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_tenant_management_privileged: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      process_batch_v1: {
        Args: { p_batch_id: string }
        Returns: {
          approved: number
          quarantined: number
          total_rows: number
        }[]
      }
      purge_expired_whatsapp_logs: {
        Args: { days_to_keep?: number }
        Returns: undefined
      }
      receive_purchase_order_v1: { Args: { p_po_id: string }; Returns: Json }
      record_event_v1: {
        Args: {
          p_action: string
          p_description?: string
          p_entity_id?: string
          p_entity_type?: string
          p_metadata?: Json
          p_source?: string
          p_tenant_id?: string
          p_who_id?: string
          p_who_type?: string
        }
        Returns: string
      }
      reject_purchase_v1: {
        Args: {
          p_purchase_id: string
          p_queue_id: string
          p_rejection_note?: string
        }
        Returns: undefined
      }
      release_expired_quarantines_v1: {
        Args: never
        Returns: {
          errors: string[]
          released_pending: number
          released_purchases: number
        }[]
      }
      resolve_purchase_quarantine_v1: {
        Args: { p_purchase_id: string; p_status: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      safe_cast_user_uuid: { Args: { p_val: string }; Returns: string }
      safe_cast_uuid: { Args: { p_val: string }; Returns: string }
      save_receipt_v3:
        | { Args: { p_expense: Json }; Returns: string }
        | { Args: { p_expense: Json; p_items: Json }; Returns: string }
        | {
            Args: { p_expense: Json; p_items: Json; p_location_id: string }
            Returns: string
          }
      save_receipt_v4: {
        Args: { p_items: Json; p_location_id: string; p_transaction: Json }
        Returns: string
      }
      service_soft_delete_transaction_v1: {
        Args: { p_id: string; p_tenant_id: string }
        Returns: Json
      }
      service_update_transaction_v1: {
        Args: { p_id: string; p_tenant_id: string; p_updates: Json }
        Returns: Json
      }
      soft_delete_transaction_v1: { Args: { p_id: string }; Returns: Json }
      switch_tenant: { Args: { p_tenant_id: string }; Returns: undefined }
      update_graph_sync_queue_status_v1: {
        Args: {
          p_id: string
          p_last_error?: string
          p_retry_count?: number
          p_status: string
        }
        Returns: undefined
      }
      update_tenant_config_v1: { Args: { p_config: Json }; Returns: Json }
      update_transaction_v1: {
        Args: { p_id: string; p_transaction: Json }
        Returns: Json
      }
      upsert_app_user_v1: { Args: { p_tenant_id: string }; Returns: undefined }
      verify_tenant_access: {
        Args: { input_code: string }
        Returns: {
          target_id: string
          target_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  ims: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
