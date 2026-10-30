import { useState, useEffect, useRef, useCallback } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { motion } from 'framer-motion';
import ImageCard from './ImageCard';
import SkeletonCard from './SkeletonCard';
import { staggerContainer, staggerItem } from '../styles/animations';

const SKELETON_HEIGHTS = [300, 360, 270, 400, 310, 330, 285, 370, 250, 320, 295, 345];

/**
 * Responsive masonry gallery with infinite scroll and skeleton loading.
 * @param {object[]} photos - array of photo objects to display
 * @param {boolean}  loading - show skeleton when true
 * @param {string}   title   - optional section title
 * @param {string}   subtitle - optional section subtitle
 */
export default function GalleryGrid({ photos, loading = false, title, subtitle }) {
  const [visibleCount, setVisibleCount] = useState(20);
  const loaderRef = useRef(null);

  const hasMore = visibleCount < photos.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 12, photos.length));
  }, [photos.length]);

  // Reset when photo list changes (new filter/search)
  useEffect(() => {
    const timer = setTimeout(() => setVisibleCount(20), 0);
    return () => clearTimeout(timer);
  }, [photos]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  /* ── Header ──────────────────────────────────────────── */
  const Header = title ? (
    <div style={{ marginBottom: '2rem' }}>
      <h2
        className="font-poppins"
        style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{subtitle}</p>
      )}
    </div>
  ) : null;

  /* ── Skeleton ────────────────────────────────────────── */
  if (loading) {
    return (
      <div>
        {Header}
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 3, 1200: 4, 1536: 5 }}
        >
          <Masonry gutter="16px">
            {SKELETON_HEIGHTS.map((h, i) => (
              <SkeletonCard key={i} height={h} />
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </div>
    );
  }

  /* ── Empty ───────────────────────────────────────────── */
  if (photos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', padding: '6rem 1rem' }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔍</div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>
          No photos found
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Try adjusting your search or filter criteria
        </p>
      </motion.div>
    );
  }

  const visible = photos.slice(0, visibleCount);

  /* ── Gallery ─────────────────────────────────────────── */
  return (
    <div>
      {Header}

      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 3, 1200: 4, 1536: 5 }}
        >
          <Masonry gutter="16px">
            {visible.map((photo) => (
              <motion.div key={photo.id} variants={staggerItem}>
                <ImageCard photo={photo} />
              </motion.div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </motion.div>

      {/* Infinite scroll trigger */}
      <div ref={loaderRef} style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0 1rem' }}>
        {hasMore ? (
          <div style={{ display: 'flex', gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.65, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: '#334155', fontSize: '0.8rem', letterSpacing: '0.04em' }}>
            — All {photos.length} photos displayed —
          </p>
        )}
      </div>
    </div>
  );
}
