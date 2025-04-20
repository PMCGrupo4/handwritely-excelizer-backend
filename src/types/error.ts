export type AppError = Error | unknown;

export interface StorageError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface SupabaseError {
  message: string;
  code?: string;
  details?: unknown;
} 