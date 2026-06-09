import type { SafeUser, UserId } from '@synculariti/types';

export interface UpdateProfileInput {
  fullName?: string;
  phoneNumber?: string | null;
}

export interface IUserRepository {
  findById(userId: UserId): Promise<SafeUser | null>;
  findByEmail(email: string): Promise<SafeUser | null>;
  listAll(): Promise<SafeUser[]>;
  updateLastLogin(userId: UserId): Promise<void>;
  updateProfile(userId: UserId, data: UpdateProfileInput): Promise<SafeUser>;
}
