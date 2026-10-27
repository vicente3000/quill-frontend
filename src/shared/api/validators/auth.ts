import { z } from 'zod';

export const USER_ROLES = ['investor', 'teacher', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const ACCOUNT_TYPES = ['ucn', 'external'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

/**
 * Schema for user profile in authentication context
 */
export const UserProfileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  role: z.enum(USER_ROLES).default('investor'),
  accountType: z.enum(ACCOUNT_TYPES).optional(),
  username: z.string().optional(),
  watchlist: z.array(z.string()).default([]),
  availableBalance: z.number(),
  reservedBalance: z.number(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Schema for login request input
 */
export const LoginInputSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

/**
 * Schema for registration request input
 */
export const RegisterInputSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  fullName: z.string().min(1, 'Full name is required'),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must contain only letters, numbers, and underscores')
    .optional(),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

/**
 * Schema for authentication response from server
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: UserProfileSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type AuthResponseInput = z.input<typeof AuthResponseSchema>;

/**
 * Schema for registration response from server
 */
export const RegisterResponseSchema = z.object({
  message: z.string(),
  email: z.string().email(),
  username: z.string().optional(),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

/**
 * Schema for profile update input
 */
export const UpdateProfileInputSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must contain only letters, numbers, and underscores')
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

/**
 * Schema for email change input
 */
export const ChangeEmailInputSchema = z.object({
  newEmail: z.string().email('Invalid email format'),
  currentPassword: z.string().min(1, 'Current password is required'),
});

export type ChangeEmailInput = z.infer<typeof ChangeEmailInputSchema>;

/**
 * Schema for password change input
 */
export const ChangePasswordInputSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;

/**
 * Schema for adding symbols to watchlist
 */
export const AddWatchlistInputSchema = z.object({
  symbols: z.array(z.string()).min(1, 'At least one symbol is required'),
});

export type AddWatchlistInput = z.infer<typeof AddWatchlistInputSchema>;

/**
 * Schema for watchlist mutation response
 */
export const WatchlistResponseSchema = z.object({
  watchlist: z.array(z.string()),
});

export type WatchlistResponse = z.infer<typeof WatchlistResponseSchema>;

/**
 * Schema for a friend
 */
export const FriendSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  username: z.string().optional(),
});

export type Friend = z.infer<typeof FriendSchema>;

/**
 * Schema for a friend request
 */
export const FriendRequestSchema = z.object({
  _id: z.string(),
  from: FriendSchema,
  status: z.enum(['pending', 'accepted']),
  createdAt: z.string(),
});

export type FriendRequest = z.infer<typeof FriendRequestSchema>;

/**
 * Schema for friend action input
 */
export const FriendActionInputSchema = z.object({
  status: z.literal('accepted'),
});

export type FriendActionInput = z.infer<typeof FriendActionInputSchema>;

/**
 * Schema for message-only responses
 */
export const MessageResponseSchema = z.object({
  message: z.string(),
});

export type MessageResponse = z.infer<typeof MessageResponseSchema>;
