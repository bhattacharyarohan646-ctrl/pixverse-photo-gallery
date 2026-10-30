import { createContext, useContext, useState, useEffect } from 'react';

const CollectionsContext = createContext();

const INITIAL_COLLECTIONS = [
  {
    id: 'col-1',
    name: 'Neon & Cyberpunk',
    description: 'Vibrant futuristic cityscapes and moody neon glow.',
    photoIds: ['3', '5', '8'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'col-2',
    name: 'Serene Nature & Escapes',
    description: 'Tranquil forests, misty mountains, and calm waters.',
    photoIds: ['1', '4', '7'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'col-3',
    name: 'Minimal Architecture',
    description: 'Clean geometry, structural shadows, and modern forms.',
    photoIds: ['2', '6'],
    createdAt: new Date().toISOString(),
  }
];

export function CollectionsProvider({ children }) {
  const [collections, setCollections] = useState(() => {
    try {
      const stored = localStorage.getItem('pixverse_collections');
      return stored ? JSON.parse(stored) : INITIAL_COLLECTIONS;
    } catch {
      return INITIAL_COLLECTIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pixverse_collections', JSON.stringify(collections));
    } catch (e) {
      console.warn('Failed to save collections to localStorage', e);
    }
  }, [collections]);

  const createCollection = (name, description = '') => {
    const newCol = {
      id: `col-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      photoIds: [],
      createdAt: new Date().toISOString(),
    };
    setCollections(prev => [newCol, ...prev]);
    return newCol;
  };

  const deleteCollection = (id) => {
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  const addPhotoToCollection = (collectionId, photoId) => {
    setCollections(prev =>
      prev.map(col => {
        if (col.id === collectionId) {
          const exists = col.photoIds.includes(String(photoId));
          if (!exists) {
            return { ...col, photoIds: [String(photoId), ...col.photoIds] };
          }
        }
        return col;
      })
    );
  };

  const removePhotoFromCollection = (collectionId, photoId) => {
    setCollections(prev =>
      prev.map(col => {
        if (col.id === collectionId) {
          return { ...col, photoIds: col.photoIds.filter(id => id !== String(photoId)) };
        }
        return col;
      })
    );
  };

  const isPhotoInCollection = (collectionId, photoId) => {
    const col = collections.find(c => c.id === collectionId);
    return col ? col.photoIds.includes(String(photoId)) : false;
  };

  const getCollectionsForPhoto = (photoId) => {
    return collections.filter(c => c.photoIds.includes(String(photoId)));
  };

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        createCollection,
        deleteCollection,
        addPhotoToCollection,
        removePhotoFromCollection,
        isPhotoInCollection,
        getCollectionsForPhoto,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
}

export const useCollections = () => {
  const context = useContext(CollectionsContext);
  if (!context) throw new Error('useCollections must be used within CollectionsProvider');
  return context;
};
