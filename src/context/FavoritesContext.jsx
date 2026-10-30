/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useLocalStorage('pixverse-favorites', []);

  const addFavorite = useCallback(
    (id) => setFavoriteIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setFavoriteIds]
  );

  const removeFavorite = useCallback(
    (id) => setFavoriteIds((prev) => prev.filter((fid) => fid !== id)),
    [setFavoriteIds]
  );

  const toggleFavorite = useCallback(
    (id) =>
      setFavoriteIds((prev) =>
        prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
      ),
    [setFavoriteIds]
  );

  const isFavorite = useCallback(
    (id) => favoriteIds.includes(id),
    [favoriteIds]
  );

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, addFavorite, removeFavorite, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    return {
      favoriteIds: [],
      addFavorite: () => {},
      removeFavorite: () => {},
      toggleFavorite: () => {},
      isFavorite: () => false,
    };
  }
  return ctx;
};
