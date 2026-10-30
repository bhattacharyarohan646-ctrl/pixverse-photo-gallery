import { createContext, useContext, useState, useEffect } from 'react';

const DownloadsContext = createContext();

export function DownloadsProvider({ children }) {
  const [downloads, setDownloads] = useState(() => {
    try {
      const stored = localStorage.getItem('pixverse_downloads');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pixverse_downloads', JSON.stringify(downloads));
    } catch (e) {
      console.warn('Failed to save downloads to localStorage', e);
    }
  }, [downloads]);

  const recordDownload = (photo, customFormat = 'Original JPG', resolution = null) => {
    if (!photo) return;
    const entry = {
      id: `dl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      photoId: String(photo.id),
      title: photo.title || 'Untitled',
      photographer: photo.photographer || 'Unknown',
      category: photo.category || 'General',
      imgUrl: photo.imgUrl || photo.thumbUrl,
      rawUrl: photo.rawUrl || photo.fullUrl || photo.imgUrl,
      resolution: resolution || photo.resolution || 'High-Res',
      format: customFormat,
      downloadedAt: new Date().toISOString(),
    };

    setDownloads(prev => [entry, ...prev.slice(0, 99)]); // Keep last 100
  };

  const removeDownload = (id) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
  };

  const clearDownloads = () => {
    setDownloads([]);
  };

  return (
    <DownloadsContext.Provider
      value={{
        downloads,
        recordDownload,
        removeDownload,
        clearDownloads,
      }}
    >
      {children}
    </DownloadsContext.Provider>
  );
}

export const useDownloads = () => {
  const context = useContext(DownloadsContext);
  if (!context) throw new Error('useDownloads must be used within DownloadsProvider');
  return context;
};
