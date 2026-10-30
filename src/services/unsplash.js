import axios from 'axios';
import { photos } from '../data/photos';
import { searchPhotos, sortPhotos } from '../utils/helpers';

const UNSPLASH_API = 'https://api.unsplash.com';
const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const isKeyValid = (key) => {
  return Boolean(
    key &&
    typeof key === 'string' &&
    key.length > 20 &&
    !key.toLowerCase().includes('paste') &&
    !key.toLowerCase().includes('your_unsplash')
  );
};

const hasKey = isKeyValid(ACCESS_KEY);

// Create axios instance only if key is valid
const api = axios.create({
  baseURL: UNSPLASH_API,
  headers: hasKey ? { Authorization: `Client-ID ${ACCESS_KEY}` } : {}
});

// Normalize Unsplash photo to match our local structure
export const normalizePhoto = (uPhoto) => ({
  id: String(uPhoto.id),
  title: (uPhoto.alt_description || uPhoto.description || 'Untitled').replace(/^./, str => str.toUpperCase()),
  photographer: uPhoto.user?.name || 'Unknown',
  category: uPhoto.tags?.[0]?.title ? uPhoto.tags[0].title.replace(/^./, str => str.toUpperCase()) : 'Unsplash',
  imgUrl: uPhoto.urls?.regular || uPhoto.urls?.full,
  thumbUrl: uPhoto.urls?.small || uPhoto.urls?.thumb,
  fullUrl: uPhoto.urls?.full,
  rawUrl: uPhoto.urls?.raw, // useful for downloads
  downloadLocation: uPhoto.links?.download_location,
  resolution: `${uPhoto.width}×${uPhoto.height}`,
  camera: uPhoto.exif?.model || 'Unknown Camera',
  lens: uPhoto.exif?.focal_length ? `${uPhoto.exif.focal_length}mm f/${uPhoto.exif.aperture}` : 'Unknown Lens',
  tags: uPhoto.tags ? uPhoto.tags.map(t => t.title) : [],
  description: uPhoto.description || uPhoto.alt_description || 'No description provided.',
  views: uPhoto.views || Math.floor(Math.random() * 50000) + 1000,
  downloads: uPhoto.downloads || Math.floor(Math.random() * 5000) + 100,
  dateAdded: uPhoto.created_at,
  featured: false,
  trending: false,
  color: uPhoto.color,
  isUnsplash: true,
});

export const searchImages = async (query, page = 1, filters = {}) => {
  if (!hasKey) {
    return fallbackSearch(query, page, filters);
  }

  try {
    const params = { query, page, per_page: 20 };
    if (filters.orientation) params.orientation = filters.orientation;
    if (filters.color) params.color = filters.color;
    
    // If no query, Unsplash search fails. We should fetch random or popular.
    if (!query) {
      const res = await api.get('/photos', { params: { page, per_page: 20, order_by: 'popular' } });
      return {
        results: res.data.map(normalizePhoto),
        total: 1000,
        totalPages: 50,
        isFallback: false
      };
    }
    
    const res = await api.get('/search/photos', { params });
    return {
      results: res.data.results.map(normalizePhoto),
      total: res.data.total,
      totalPages: res.data.total_pages,
      isFallback: false
    };
  } catch (error) {
    console.warn("Unsplash Search Error, falling back to local data:", error.message);
    return fallbackSearch(query, page, filters);
  }
};

export const getTrendingImages = async (page = 1) => {
  if (!hasKey) {
    return fallbackRandom(page);
  }

  try {
    const res = await api.get('/photos', { params: { page, per_page: 20, order_by: 'popular' } });
    return {
      results: res.data.map(normalizePhoto),
      isFallback: false
    };
  } catch (error) {
    console.warn("Unsplash Trending Error, falling back to local data:", error.message);
    return fallbackRandom(page);
  }
};

export const getPhotoById = async (id) => {
  // Check if it's a local ID first (numeric or local string format)
  if (!isNaN(id) || String(id).length < 10) {
    const local = photos.find(p => String(p.id) === String(id));
    if (local) return local;
  }

  if (!hasKey) {
    return photos.find(p => String(p.id) === String(id));
  }

  try {
    const res = await api.get(`/photos/${id}`);
    return normalizePhoto(res.data);
  } catch (error) {
    console.warn("Unsplash GetPhoto Error, falling back:", error.message);
    return photos.find(p => String(p.id) === String(id));
  }
};

export const getRelatedPhotos = async (id, count = 6) => {
  if (!hasKey || (!isNaN(id) || String(id).length < 10)) {
    return sortPhotos(photos, 'popular').filter(p => String(p.id) !== String(id)).slice(0, count);
  }
  
  try {
    const res = await api.get(`/photos/${id}/related`);
    return res.data.results.slice(0, count).map(normalizePhoto);
  } catch (error) {
    console.warn("Unsplash Related Error, falling back:", error.message);
    return sortPhotos(photos, 'popular').filter(p => String(p.id) !== String(id)).slice(0, count);
  }
};

export const triggerDownload = async (downloadLocation) => {
  if (!hasKey || !downloadLocation) return null;
  try {
    const res = await axios.get(downloadLocation, {
      headers: { Authorization: `Client-ID ${ACCESS_KEY}` }
    });
    return res.data.url;
  } catch (err) {
    console.warn("Download tracking failed", err.message);
    return null;
  }
};

// Fallback Functions
const fallbackSearch = (query, page) => {
  const perPage = 20;
  let results = query ? searchPhotos(photos, query) : photos;
  
  const total = results.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated = results.slice((page - 1) * perPage, page * perPage);
  
  return {
    results: paginated,
    total,
    totalPages,
    isFallback: true
  };
};

const fallbackRandom = (page) => {
  const perPage = 20;
  const sorted = sortPhotos(photos, 'popular');
  return {
    results: sorted.slice((page - 1) * perPage, page * perPage),
    isFallback: true
  };
};
