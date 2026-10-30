import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiHeart, FiDownload, FiShare2, FiMaximize2,
  FiCalendar, FiCamera, FiEye, FiSliders, FiSmartphone,
  FiFolderPlus, FiEdit3, FiCheck, FiPlay
} from 'react-icons/fi';
import { getPhotoById, getRelatedPhotos, triggerDownload } from '../services/unsplash';
import { useFavorites } from '../context/FavoritesContext';
import { useDownloads } from '../context/DownloadsContext';
import { useToast } from '../context/ToastContext';
import { downloadImage, shareImage, formatNumber, formatDate } from '../utils/helpers';
import ImageModal from '../components/ImageModal';
import PhotoStudioModal from '../components/PhotoStudioModal';
import MockupPreviewModal from '../components/MockupPreviewModal';
import AddToCollectionModal from '../components/AddToCollectionModal';
import CinemaSlideshowModal from '../components/CinemaSlideshowModal';
import ColorPaletteCard from '../components/ColorPaletteCard';
import GalleryGrid from '../components/GalleryGrid';
import Button from '../components/Button';
import { pageTransition } from '../styles/animations';

export default function ImageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [mockupOpen, setMockupOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [cinemaOpen, setCinemaOpen] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { recordDownload } = useDownloads();
  const { showToast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;
    
    const fetchPhotoData = async () => {
      setLoading(true);
      const found = await getPhotoById(id);
      if (active) {
        if (found) {
          setPhoto(found);
          const rel = await getRelatedPhotos(id, 6);
          setRelated(rel);
        } else {
          navigate('/404');
        }
        setLoading(false);
      }
    };

    fetchPhotoData();
    return () => { active = false; };
  }, [id, navigate]);

  if (loading || !photo) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="shimmer" style={{ width: '80%', height: '60vh', borderRadius: 24 }} />
      </div>
    );
  }

  const fav = isFavorite(photo.id);

  /* ── Handlers ────────────────────────────────────────── */
  const handleFav = () => {
    toggleFavorite(photo.id);
    showToast({ message: fav ? 'Removed from Favorites' : 'Added to Favorites', type: fav ? 'info' : 'success' });
  };

  const handleDL = async () => {
    showToast({ message: 'Starting high-definition download…', type: 'info' });
    if (photo.downloadLocation) {
      await triggerDownload(photo.downloadLocation);
    }
    const dlUrl = photo.rawUrl || photo.fullUrl || photo.imgUrl;
    const ok = await downloadImage(dlUrl, photo.title);
    if (ok) {
      recordDownload(photo, 'Original JPG', photo.resolution);
      showToast({ message: 'Download complete! Saved to your Downloads Hub.', type: 'success' });
    } else {
      showToast({ message: 'Download failed.', type: 'error' });
    }
  };

  const handleShare = async () => {
    const res = await shareImage(photo.title);
    if (res === 'copied') showToast({ message: 'Link copied to clipboard!', type: 'success' });
    else if (res === 'shared') showToast({ message: 'Shared successfully!', type: 'success' });
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" style={{ paddingTop: 90, paddingBottom: 100 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: '#94a3b8', background: 'none', border: 'none',
            cursor: 'pointer', marginBottom: 24, fontSize: '0.95rem', fontWeight: 500
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >
          <FiArrowLeft /> Back to Gallery
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: 40 }} className="lg-grid-stack">
          
          {/* ── Left Column: Image & Quick Creative Studio Trigger ── */}
          <div>
            <div
              style={{
                position: 'relative', borderRadius: 24, overflow: 'hidden',
                background: '#111827', cursor: 'zoom-in', boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
              onClick={() => setModalOpen(true)}
              className="group"
            >
              <img
                src={photo.imgUrl}
                alt={photo.title}
                style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }}
              />
              <div
                style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)',
                  opacity: 0, transition: 'opacity 0.3s', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
                className="group-hover:opacity-100"
              >
                <div style={{
                  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                  padding: '12px 24px', borderRadius: 999, color: '#fff',
                  display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <FiMaximize2 /> View Fullscreen
                </div>
              </div>
            </div>
            
            {/* 🌟 Interactive Creative Power Toolbar 🌟 */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 12, marginTop: 20
            }}>
              <button
                onClick={() => setStudioOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 16px', borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.15))',
                  border: '1px solid rgba(236,72,153,0.4)',
                  color: '#F472B6', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(236,72,153,0.15)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FiEdit3 size={16} /> Photo Studio
              </button>

              <button
                onClick={() => setMockupOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 16px', borderRadius: 14,
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  color: '#34D399', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FiSmartphone size={16} /> Device Mockup
              </button>

              <button
                onClick={() => setCollectionOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 16px', borderRadius: 14,
                  background: 'rgba(59,130,246,0.12)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: '#60A5FA', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FiFolderPlus size={16} /> Add to Board
              </button>

              <button
                onClick={() => setCinemaOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 16px', borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))',
                  border: '1px solid rgba(139,92,246,0.4)',
                  color: '#C084FC', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FiPlay size={16} /> Ambient Cinema
              </button>
            </div>

            {/* Mobile Action Bar */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }} className="lg-hidden">
              <Button variant="primary" fullWidth icon={<FiDownload />} onClick={handleDL}>Download Free</Button>
              <Button variant={fav ? 'danger' : 'ghost'} onClick={handleFav}><FiHeart style={{ fill: fav ? 'currentColor' : 'none' }} /></Button>
              <Button variant="ghost" onClick={handleShare}><FiShare2 /></Button>
            </div>
          </div>

          {/* ── Right Column: Details & Color Extraction ────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <Link to={`/gallery?cat=${photo.category}`} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: 999, background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)' }}>
                  {photo.category}
                </Link>
                {photo.featured && <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: 999, background: 'rgba(168,85,247,0.15)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.3)' }}>★ Editor's Pick</span>}
              </div>

              <h1 className="font-poppins" style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.4rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>
                {photo.title}
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${photo.photographer.replace(/\s+/g,'')}&backgroundColor=b6e3f4`} alt={photo.photographer} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>{photo.photographer}</p>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Master Photographer</p>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.7, marginBottom: 24 }}>
                {photo.description}
              </p>
            </div>

            {/* Action Bar Desktop */}
            <div style={{ display: 'flex', gap: 12 }} className="hidden lg-flex">
              <Button size="lg" variant="primary" fullWidth icon={<FiDownload />} onClick={handleDL}>Download High-Res</Button>
              <Button size="lg" variant={fav ? 'danger' : 'ghost'} onClick={handleFav} title={fav ? 'Remove Favorite' : 'Add Favorite'}>
                <FiHeart size={20} style={{ fill: fav ? 'currentColor' : 'none' }} />
              </Button>
              <Button size="lg" variant="ghost" onClick={handleShare} title="Share">
                <FiShare2 size={20} />
              </Button>
            </div>

            {/* 🎨 AI Harmonic Color Palette Extractor */}
            <ColorPaletteCard imageUrl={photo.imgUrl} photoTitle={photo.title} />

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

            {/* Technical EXIF Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <MetaItem icon={<FiCamera />} label="Camera Gear" value={photo.camera} />
              <MetaItem icon={<FiCamera />} label="Lens" value={photo.lens || 'Prime Optical'} />
              <MetaItem icon={<FiMaximize2 />} label="Max Resolution" value={photo.resolution} />
              <MetaItem icon={<FiCalendar />} label="Captured On" value={formatDate(photo.dateAdded)} />
              <MetaItem icon={<FiEye />} label="Total Views" value={formatNumber(photo.views)} />
              <MetaItem icon={<FiDownload />} label="Downloads" value={formatNumber(photo.downloads)} />
            </div>

            {/* Tags */}
            {photo.tags && photo.tags.length > 0 && (
              <div>
                <h4 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, marginBottom: 10 }}>Semantic Tags</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {photo.tags.map(t => (
                    <Link key={t} to={`/gallery?q=${t}`} className="tag-pill">#{t}</Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Related Photos ─────────────────────────────────── */}
        {related.length > 0 && (
          <div style={{ marginTop: 80, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <GalleryGrid photos={related} title="More like this" subtitle={`Explore other incredible masterpieces.`} />
          </div>
        )}

      </div>

      {/* Fullscreen Lightbox Modal */}
      <ImageModal open={modalOpen} close={() => setModalOpen(false)} slides={[{ src: photo.imgUrl, alt: photo.title }]} />

      {/* 🎨 Creative Photo Studio Modal */}
      <PhotoStudioModal isOpen={studioOpen} onClose={() => setStudioOpen(false)} photo={photo} />

      {/* 📱 Device Wallpaper & Mockup Previewer Modal */}
      <MockupPreviewModal isOpen={mockupOpen} onClose={() => setMockupOpen(false)} photo={photo} />

      {/* 📁 Add to Moodboard Collection Modal */}
      <AddToCollectionModal isOpen={collectionOpen} onClose={() => setCollectionOpen(false)} photo={photo} />

      {/* 🎬 Ambient Cinema Mode Modal */}
      <CinemaSlideshowModal isOpen={cinemaOpen} onClose={() => setCinemaOpen(false)} photos={[photo, ...related]} />

      <style>{`
        @media (max-width: 1024px) {
          .lg-grid-stack { grid-template-columns: 1fr !important; }
          .lg-hidden { display: flex !important; }
          .hidden.lg-flex { display: none !important; }
        }
        @media (min-width: 1025px) {
          .lg-hidden { display: none !important; }
        }
      `}</style>
    </motion.div>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ color: '#64748b', marginTop: 2 }}>{icon}</div>
      <div>
        <p style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>{label}</p>
        <p style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>{value}</p>
      </div>
    </div>
  );
}
