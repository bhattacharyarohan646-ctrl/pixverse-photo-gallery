import { useState, useEffect, useCallback, useMemo } from 'react';
import { searchPhotos } from '../utils/helpers';

/**
 * Debounced search hook
 * @param {Array} items - full list of photos
 * @param {number} delay - debounce delay in ms (default 280)
 */
export function useSearch(items, delay = 280) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), delay);
    return () => clearTimeout(timer);
  }, [query, delay]);

  const results = useMemo(() => searchPhotos(items, debouncedQuery), [items, debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return { query, setQuery, results, clearSearch, debouncedQuery };
}
