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

export const parseToDate = (val?: string | number | Date | null): Date | null => {
  if (val === undefined || val === null || val === '') return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'number') {
    const ms = val < 1e11 ? val * 1000 : val;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    if (/^\d+$/.test(val)) {
      const num = Number(val);
      const ms = num < 1e11 ? num * 1000 : num;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

export const formatDate = (timestamp?: string | number | Date | null): string => {
  const d = parseToDate(timestamp);
  if (!d) return 'N/A';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const toDateInputValue = (timestamp?: string | number | Date | null): string => {
  const d = parseToDate(timestamp);
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
