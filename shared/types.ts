import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { lookups, users, projects, tasks, learnings } from '../db/schema';

export type Lookup = InferSelectModel<typeof lookups>;
export type NewLookup = InferInsertModel<typeof lookups>;

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type SafeUser = Omit<User, 'passwordHash'>;

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;

export type Learning = InferSelectModel<typeof learnings>;
export type NewLearning = InferInsertModel<typeof learnings>;

export interface AuthSession {
  userId: string;
  email: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
