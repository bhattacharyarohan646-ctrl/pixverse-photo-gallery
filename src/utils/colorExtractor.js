/**
 * PixVerse Color Extractor Utility
 * Extracts harmonic dominant color palettes from any image using HTML Canvas
 */

/**
 * Extracts dominant color palette from an image URL
 * @param {string} imageUrl 
 * @param {number} colorCount - Number of colors to return (default 5)
 * @returns {Promise<Array<{hex: string, rgb: string, isDark: boolean, name: string}>>}
 */
export const extractPaletteFromImage = (imageUrl, colorCount = 5) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const sampleSize = 100; // Small sample for performance
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        const colorBuckets = {};

        // Quantize colors in 32-value intervals
        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          // Skip transparent or near-black/near-white extremes for better palette variety
          if (a < 128) continue;
          
          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;
          const key = `${qr},${qg},${qb}`;

          colorBuckets[key] = (colorBuckets[key] || 0) + 1;
        }

        // Sort by frequency
        const sortedColors = Object.entries(colorBuckets)
          .sort((a, b) => b[1] - a[1])
          .slice(0, colorCount * 2);

        // Filter for color distinctness
        const distinct = [];
        for (const [key] of sortedColors) {
          const [r, g, b] = key.split(',').map(Number);
          const isTooClose = distinct.some(d => {
            return (
              Math.abs(d.r - r) < 35 &&
              Math.abs(d.g - g) < 35 &&
              Math.abs(d.b - b) < 35
            );
          });

          if (!isTooClose) {
            const hex = rgbToHex(r, g, b);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            distinct.push({
              r, g, b,
              hex,
              rgb: `rgb(${r}, ${g}, ${b})`,
              isDark: luminance < 0.5,
              name: getColorName(r, g, b)
            });
          }
          if (distinct.length >= colorCount) break;
        }

        if (distinct.length > 0) {
          resolve(distinct);
        } else {
          resolve(getDefaultPalette());
        }
      } catch (err) {
        console.warn('Palette extraction error:', err);
        resolve(getDefaultPalette());
      }
    };

    img.onerror = () => {
      resolve(getDefaultPalette());
    };
  });
};

const rgbToHex = (r, g, b) =>
  '#' + [r, g, b].map(x => {
    const hex = Math.min(255, Math.max(0, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();

const getColorName = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (max < 40) return 'Obsidian';
  if (min > 220) return 'Pure White';
  if (delta < 20) return 'Neutral Slate';

  if (r > g && r > b) {
    if (g > 150) return 'Amber Warmth';
    if (b > 120) return 'Magenta Glow';
    return 'Crimson';
  } else if (g > r && g > b) {
    if (b > 120) return 'Aqua Teal';
    return 'Emerald';
  } else {
    if (r > 120) return 'Royal Purple';
    return 'Ocean Blue';
  }
};

const getDefaultPalette = () => [
  { hex: '#1E293B', rgb: 'rgb(30, 41, 59)', isDark: true, name: 'Slate Deep' },
  { hex: '#3B82F6', rgb: 'rgb(59, 130, 246)', isDark: false, name: 'Ocean Blue' },
  { hex: '#8B5CF6', rgb: 'rgb(139, 92, 246)', isDark: false, name: 'Purple Dream' },
  { hex: '#10B981', rgb: 'rgb(16, 185, 129)', isDark: false, name: 'Emerald' },
  { hex: '#F59E0B', rgb: 'rgb(245, 158, 11)', isDark: false, name: 'Amber Glow' },
];
