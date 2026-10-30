import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiPlay } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import GalleryGrid from '../components/GalleryGrid';
import CinemaSlideshowModal from '../components/CinemaSlideshowModal';
import { getTrendingImages } from '../services/unsplash';
import { FEATURED_COLLECTIONS, photos as LOCAL_PHOTOS } from '../data/photos';
import { pageTransition } from '../styles/animations';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trendingPhotos, setTrendingPhotos] = useState([]);
  const [cinemaOpen, setCinemaOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;

    const loadData = async () => {
      setLoading(true);
      const res = await getTrendingImages(1);
      if (active) {
        setTrendingPhotos(res.results || LOCAL_PHOTOS);
        setLoading(false);
      }
    };

    loadData();
    return () => { active = false; };
  }, []);

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
      <Hero onOpenCinema={() => setCinemaOpen(true)} />

      {/* ── Trending Section ──────────────────────────────── */}
      <section id="trending" className="section-bg" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 className="font-poppins gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>
                Trending Now
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>The most viewed photos this week</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => setCinemaOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer',
                  fontSize: '0.9rem', boxShadow: '0 4px 16px rgba(139,92,246,0.3)'
                }}
              >
                <FiPlay /> Cinema Mode
              </button>

              <button
                onClick={() => navigate('/gallery?sort=popular')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: '#3B82F6', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '1rem'
                }}
                className="hidden md:flex"
              >
                View all <FiArrowRight />
              </button>
            </div>
          </div>

          <GalleryGrid photos={trendingPhotos.slice(0, 10)} loading={loading} />
          
          <div style={{ textAlign: 'center', marginTop: 40 }} className="md:hidden">
            <button
              onClick={() => navigate('/gallery?sort=popular')}
              style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid #3B82F6', color: '#3B82F6', background: 'rgba(59,130,246,0.1)', fontWeight: 600 }}
            >
              View all trending
            </button>
          </div>
        </div>
      </section>

      {/* ── Featured Collections ──────────────────────────── */}
      <section style={{ padding: '80px 20px', background: '#0B0F19', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <h2 className="font-poppins" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: 40, textAlign: 'center' }}>
            Featured Collections
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {FEATURED_COLLECTIONS.map((col, i) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                onClick={() => navigate(`/gallery?cat=${col.title.split(' ').pop()}`)}
                style={{
                  height: 320, borderRadius: 24, overflow: 'hidden', position: 'relative', cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
                className="group"
              >
                <img
                  src={col.cover}
                  alt={col.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}
                  className="group-hover:scale-110"
                />
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                    padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                  }}
                >
                  <span style={{ color: col.color, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                    {col.count} Photos
                  </span>
                  <h3 className="font-poppins" style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
                    {col.title}
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {col.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Editor's Picks ────────────────────────────────── */}
      <section className="section-bg" style={{ padding: '80px 20px 100px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="font-poppins" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              Editor's Picks
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Hand-selected masterpieces from our community</p>
          </div>
          
          <GalleryGrid photos={trendingPhotos.slice(10, 16)} loading={loading} />

          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <button
              onClick={() => navigate('/gallery')}
              className="btn-glow-primary"
              style={{
                padding: '16px 40px', borderRadius: 16,
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                color: '#fff', fontSize: '1.1rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 10,
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Explore Full Gallery <FiArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* 🎬 Ambient Cinema Modal */}
      <CinemaSlideshowModal
        isOpen={cinemaOpen}
        onClose={() => setCinemaOpen(false)}
        photos={trendingPhotos.length > 0 ? trendingPhotos : LOCAL_PHOTOS}
      />
    </motion.div>
  );
}
