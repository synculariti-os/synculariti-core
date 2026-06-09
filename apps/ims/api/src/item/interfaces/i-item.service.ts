import type { ItemWithOverride, ItemId, RestaurantId, FranchiseGroupId, Item, Category, UomConversion, ItemRestaurantOverride, ItemType } from '@synculariti/types';
import type { 
  CreateItemDto, 
  UpdateItemDto, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CreateUomConversionDto, 
  UpdateItemOverrideDto 
} from '@synculariti/validators';

/** Backend-only: item creation command with owner context injected by the service. */
export type CreateItemCommand = CreateItemDto & {
  restaurantId: RestaurantId | null;
  franchiseGroupId: FranchiseGroupId | null;
};


/** Backend-only: category creation command with owner context. */
export type CreateCategoryCommand = CreateCategoryDto & {
  restaurantId: RestaurantId | null;
  franchiseGroupId: FranchiseGroupId | null;
};

export interface IItemReadService {
  findById(itemId: ItemId, restaurantId: RestaurantId): Promise<ItemWithOverride>;
  findBySku(sku: string, restaurantId: RestaurantId): Promise<Item | null>;
  convertUom(itemId: ItemId, qty: number, fromUom: string, toUom: string): Promise<number>;
  listParLevels(restaurantId: RestaurantId, page?: number, limit?: number): Promise<{ data: ItemWithOverride[]; meta: { total: number; page: number; limit: number; totalPages: number } }>;
  listCategories(restaurantId: RestaurantId, franchiseGroupId: string | null, itemType?: string | null): Promise<Category[]>;
}

export interface IItemWriteService extends IItemReadService {
  createItem(dto: CreateItemDto, restaurantId: RestaurantId | null, franchiseGroupId: string | null): Promise<Item>;
  updateItem(itemId: ItemId, dto: UpdateItemDto): Promise<Item>;
  deleteItem(itemId: ItemId): Promise<void>;
  deleteItemsBulk(itemIds: ItemId[]): Promise<void>;
  createCategory(dto: CreateCategoryDto, restaurantId: RestaurantId | null, franchiseGroupId: string | null): Promise<Category>;
  updateCategory(categoryId: string, dto: UpdateCategoryDto): Promise<Category>;
  deleteCategory(categoryId: string): Promise<void>;
  deleteCategoriesBulk(categoryIds: string[]): Promise<void>;
  listUomConversions(itemId: ItemId): Promise<UomConversion[]>;
  deleteUomConversion(id: string): Promise<void>;
  upsertUomConversion(dto: CreateUomConversionDto): Promise<UomConversion>;
  updateOverride(itemId: ItemId, restaurantId: RestaurantId, dto: UpdateItemOverrideDto): Promise<ItemRestaurantOverride>;
  generateSku(categoryId: string, restaurantId: RestaurantId | null): Promise<string>;
  ensureItemDependencies(
    dto: { sku: string; name: string; categoryName: string; type: ItemType; uom?: string },
    restaurantId: RestaurantId | null,
    franchiseGroupId: string | null,
  ): Promise<string | null>;
}

export const ITEM_READ_SERVICE_TOKEN = Symbol('IItemReadService');
export const ITEM_WRITE_SERVICE_TOKEN = Symbol('IItemWriteService');
