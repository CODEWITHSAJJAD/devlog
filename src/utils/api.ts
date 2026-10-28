import type { ApiResponse } from '../../shared/types';

export const apiFetch = async <T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> => {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      credentials: 'include',
    });
    const data = (await res.json()) as ApiResponse<T>;
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
};

export const formatDate = (timestamp?: number | Date | null): string => {
  if (!timestamp) return 'N/A';
  if (timestamp instanceof Date) return timestamp.toLocaleDateString();
  return new Date(timestamp * 1000).toLocaleDateString();
};
