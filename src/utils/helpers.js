/**
 * PixVerse Utility Helpers
 */

/** Format large numbers to readable strings */
export const formatNumber = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return String(num);
};

/** Format ISO date string to human-readable */
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

/** Fetch + download image as a file */
export const downloadImage = async (url, title) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-pixverse.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    return true;
  } catch (err) {
    console.error('Download failed:', err);
    return false;
  }
};

/** Share via Web Share API or clipboard fallback */
export const shareImage = async (title) => {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: `PixVerse – ${title}`, url });
      return 'shared';
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
      return 'aborted';
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
};

/** Sort photos array by given criteria */
export const sortPhotos = (photos, sortBy) => {
  const sorted = [...photos];
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
    case 'az':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'za':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'popular':
      return sorted.sort((a, b) => b.views - a.views);
    default:
      return sorted;
  }
};

/** Search photos by query across multiple fields */
export const searchPhotos = (photos, query) => {
  if (!query.trim()) return photos;
  const q = query.toLowerCase();
  return photos.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.photographer.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q)
  );
};

/** Clamp string to n characters */
export const truncate = (str, n) =>
  str.length > n ? str.slice(0, n) + '...' : str;

/** Generate a random integer between min and max inclusive */
export const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
