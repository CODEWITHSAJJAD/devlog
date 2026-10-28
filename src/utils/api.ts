import type { ApiResponse } from '../../shared/types';

export const apiFetch = async <T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> => {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      credentials: 'include',
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = (await res.json()) as ApiResponse<T>;
      return data;
    }
    const text = await res.text();
    return {
      success: false,
      error: res.status ? `HTTP ${res.status}: ${text.slice(0, 120)}` : 'Network request failed',
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
};

export const formatDate = (timestamp?: number | Date | null): string => {
  if (!timestamp) return 'N/A';
  if (timestamp instanceof Date) return timestamp.toLocaleDateString();
  return new Date(timestamp * 1000).toLocaleDateString();
};
