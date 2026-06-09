import { z } from 'zod';

export const createFranchiseGroupSchema = z.object({
  name: z.string().min(1),
});

export const updateFranchiseGroupSchema = z.object({
  name: z.string().min(1).optional(),
});

export const createRestaurantSchema = z.object({
  franchiseGroupId: z.string().uuid(),
  name: z.string().min(1),
  timezone: z.string().min(1),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
});

export const deleteFranchiseGroupsBulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export type CreateFranchiseGroupDto = z.infer<typeof createFranchiseGroupSchema>;
export type UpdateFranchiseGroupDto = z.infer<typeof updateFranchiseGroupSchema>;
export type CreateRestaurantDto = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantDto = z.infer<typeof updateRestaurantSchema>;
export type DeleteFranchiseGroupsBulkDto = z.infer<typeof deleteFranchiseGroupsBulkSchema>;
