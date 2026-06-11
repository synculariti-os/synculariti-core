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
