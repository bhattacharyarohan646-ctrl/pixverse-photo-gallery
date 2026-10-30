import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHeart, FiDownload, FiShare2, FiEye, FiZoomIn, FiFolderPlus } from 'react-icons/fi';
import { useFavorites } from '../context/FavoritesContext';
import { useDownloads } from '../context/DownloadsContext';
import { useToast } from '../context/ToastContext';
import { downloadImage, shareImage, formatNumber } from '../utils/helpers';
import { hoverCard } from '../styles/animations';
import AddToCollectionModal from './AddToCollectionModal';

const CATEGORY_COLORS = {
  Nature: '#22C55E', Travel: '#F59E0B', Technology: '#6366F1',
  Food: '#EF4444', Cars: '#EC4899', Architecture: '#8B5CF6',
  Animals: '#14B8A6', People: '#F97316',
};

/**
 * Gallery image card with glassmorphism, hover overlay and action buttons.
 * @param {{ photo: object }} props
 */
export default function ImageCard({ photo }) {
  const [loaded, setLoaded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { recordDownload } = useDownloads();
  const { showToast } = useToast();
  const fav = isFavorite(photo.id);
  const catColor = CATEGORY_COLORS[photo.category] ?? '#3B82F6';

  /* ── Action Handlers ─────────────────────────────────── */
  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(photo.id);
    showToast({
      message: fav ? 'Removed from Favorites' : '❤️ Added to Favorites!',
      type: fav ? 'info' : 'success',
    });
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    showToast({ message: 'Starting download…', type: 'info' });
    const ok = await downloadImage(photo.imgUrl, photo.title);
    if (ok) {
      recordDownload(photo, 'Quick JPG');
      showToast({
        message: '✅ Download complete!',
        type: 'success',
      });
    } else {
      showToast({
        message: '❌ Download failed. Try again.',
        type: 'error',
      });
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await shareImage(photo.title);
    if (result === 'copied') showToast({ message: '🔗 Link copied to clipboard!', type: 'success' });
    else if (result === 'shared') showToast({ message: '✅ Shared successfully!', type: 'success' });
  };

  /* ── Render ──────────────────────────────────────────── */
  return (
    <motion.div
      variants={hoverCard}
      initial="rest"
      whileHover="hover"
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      className="image-card"
      style={{
        borderRadius: 18,
        overflow: 'hidden',
        background: 'rgba(20,25,35,0.85)',
        border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: 16,
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <Link to={`/photo/${photo.id}`} style={{ display: 'block', color: 'inherit' }}>
        {/* ── Image Area ───────────────────────────────── */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Skeleton while loading */}
          {!loaded && (
            <div className="shimmer" style={{ width: '100%', paddingBottom: '70%' }} />
          )}

          <img
            src={photo.thumbUrl || photo.imgUrl}
            alt={photo.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className="card-img"
            style={{
              display: 'block',
              opacity: loaded ? 1 : 0.4,
              width: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Hover overlay */}
          <div
            className="card-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.05) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '12px',
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {/* Favorite */}
              <motion.button
                onClick={handleFavorite}
                whileTap={{ scale: 0.88 }}
                title={fav ? 'Remove from Favorites' : 'Add to Favorites'}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: fav ? 'rgba(239,68,68,0.3)' : 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${fav ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.12)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <FiHeart
                  size={15}
                  style={{ color: fav ? '#F87171' : '#fff', fill: fav ? 'currentColor' : 'none' }}
                />
              </motion.button>

              {/* Zoom icon */}
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <FiZoomIn size={15} style={{ color: '#fff' }} />
              </div>
            </div>

            {/* Bottom row */}
            <div>
              <p
                className="line-clamp-1"
                style={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem', marginBottom: 2 }}
              >
                {photo.title}
              </p>
              <p style={{ color: '#cbd5e1', fontSize: '0.72rem', marginBottom: 10 }}>
                by {photo.photographer}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.68rem', fontWeight: 600,
                    padding: '3px 10px', borderRadius: 999,
                    background: `${catColor}25`, color: catColor,
                    border: `1px solid ${catColor}40`,
                  }}
                >
                  {photo.category}
                </span>

                <div style={{ display: 'flex', gap: 6 }}>
                  <ActionBtn
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCollectionModal(true);
                    }}
                    title="Add to Collection / Moodboard"
                  >
                    <FiFolderPlus size={13} style={{ color: '#60A5FA' }} />
                  </ActionBtn>
                  <ActionBtn onClick={handleDownload} title="Download">
                    <FiDownload size={13} style={{ color: '#fff' }} />
                  </ActionBtn>
                  <ActionBtn onClick={handleShare} title="Share">
                    <FiShare2 size={13} style={{ color: '#fff' }} />
                  </ActionBtn>
                </div>
              </div>
            </div>
          </div>

          {/* Trending badge */}
          {photo.trending && (
            <span
              style={{
                position: 'absolute', top: 10, right: 10,
                fontSize: '0.62rem', fontWeight: 700,
                padding: '3px 8px', borderRadius: 999,
                background: 'rgba(251,191,36,0.2)',
                color: '#FCD34D',
                border: '1px solid rgba(251,191,36,0.35)',
                backdropFilter: 'blur(8px)',
                pointerEvents: 'none',
                opacity: hovering ? 0 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              🔥 Trending
            </span>
          )}
        </div>

        {/* ── Card Footer ──────────────────────────────── */}
        <div style={{ padding: '10px 13px 12px' }}>
          <h3
            className="line-clamp-1"
            style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.82rem', marginBottom: 3 }}
          >
            {photo.title}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: 7 }}>
            by {photo.photographer}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.68rem', padding: '2px 9px', borderRadius: 999,
                background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
              }}
            >
              {photo.category}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#475569' }}>
              <FiEye size={11} /> {formatNumber(photo.views)}
            </span>
          </div>
        </div>
      </Link>

      {/* Add to Collection Modal */}
      <AddToCollectionModal
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        photo={photo}
      />
    </motion.div>
  );
}

/* ── Small action button ─────────────────────────────────── */
function ActionBtn({ onClick, title, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.12)',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
    >
      {children}
    </motion.button>
  );
}
