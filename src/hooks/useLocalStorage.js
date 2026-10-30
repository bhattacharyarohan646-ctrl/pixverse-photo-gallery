import { useState } from 'react';

/**
 * Generic localStorage hook with JSON serialisation
 * @param {string} key - localStorage key
 * @param {*} initialValue - default value if key not found
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`[useLocalStorage] Error writing key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
