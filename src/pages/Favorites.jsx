import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import GalleryGrid from '../components/GalleryGrid';
import { getPhotoById } from '../services/unsplash';
import { useFavorites } from '../context/FavoritesContext';
import { pageTransition } from '../styles/animations';

export default function Favorites() {
  const { favoriteIds } = useFavorites();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [favPhotos, setFavPhotos] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;

    const loadFavorites = async () => {
      setLoading(true);
      const items = await Promise.all(favoriteIds.map(id => getPhotoById(id)));
      if (active) {
        setFavPhotos(items.filter(Boolean));
        setLoading(false);
      }
    };

    loadFavorites();
    return () => { active = false; };
  }, [favoriteIds]);

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" style={{ paddingTop: 100, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239,68,68,0.2)' }}>
            <FiHeart size={28} color="#F87171" style={{ fill: '#F87171' }} />
          </div>
          <div>
            <h1 className="font-poppins" style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              Your Favorites
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
              {favoriteIds.length} {favoriteIds.length === 1 ? 'photo' : 'photos'} saved
            </p>
          </div>
        </div>

        {favoriteIds.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(20,25,35,0.5)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <FiHeart size={64} color="#334155" style={{ marginBottom: 24 }} />
            <h2 className="font-poppins" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              No favorites yet
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: 400, margin: '0 auto 32px' }}>
              Explore the gallery and click the heart icon on any photo to save it here for later.
            </p>
            <button
              onClick={() => navigate('/gallery')}
              style={{
                padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                color: '#fff', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 10,
              }}
            >
              Explore Gallery <FiArrowRight />
            </button>
          </motion.div>
        ) : (
          <GalleryGrid photos={favPhotos} loading={loading} />
        )}

      </div>
    </motion.div>
  );
}
