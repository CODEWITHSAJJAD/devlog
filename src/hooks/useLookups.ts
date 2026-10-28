import { useState, useEffect } from 'react';
import type { Lookup } from '../../shared/types';
import { apiFetch } from '../utils/api';

export const useLookups = (category?: string) => {
  const [lookups, setLookups] = useState<Lookup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLookups = async () => {
      setIsLoading(true);
      const url = category ? `/api/lookups?category=${encodeURIComponent(category)}` : '/api/lookups';
      const res = await apiFetch<Lookup[]>(url);
      if (res.success && res.data) {
        setLookups(res.data);
      }
      setIsLoading(false);
    };
    fetchLookups();
  }, [category]);

  return { lookups, isLoading };
};
