import { motion, useScroll, useTransform } from 'framer-motion';
import SearchBar from './SearchBar';
import Button from './Button';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

/**
 * Cinematic Hero Section
 */
export default function Hero({ onOpenCinema }) {
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const handleSearch = (query) => {
    if (query.trim()) navigate(`/gallery?q=${encodeURIComponent(query)}`);
  };

  return (
    <section
      className="hero-gradient"
      style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '120px 20px 60px',
      }}
    >
      {/* Background ambient orbs */}
      <div className="orb" style={{ width: 400, height: 400, background: 'rgba(59,130,246,0.15)', top: '10%', left: '-5%' }} />
      <div className="orb" style={{ width: 500, height: 500, background: 'rgba(139,92,246,0.15)', bottom: '-10%', right: '-5%', animationDelay: '-2s' }} />
      <div className="orb" style={{ width: 300, height: 300, background: 'rgba(236,72,153,0.1)', top: '40%', left: '50%', transform: 'translateX(-50%)', animationDelay: '-4s' }} />

      <motion.div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 800,
          width: '100%',
          textAlign: 'center',
          y: y1,
          opacity,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="font-space"
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#94a3b8',
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            A Premium Gallery Experience
          </span>

          <h1
            className="font-poppins"
            style={{
              fontSize: 'clamp(2.5rem, 5vw + 1rem, 5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#fff',
              marginBottom: 24,
            }}
          >
            Discover Stunning <br />
            <span className="gradient-text">Photography.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.5vw + 0.5rem, 1.25rem)',
              color: '#cbd5e1',
              maxWidth: 600,
              margin: '0 auto 48px',
              lineHeight: 1.6,
            }}
          >
            Explore a curated collection of thousands of high-resolution images from the world's most talented photographers.
          </p>

          <div
            style={{
              maxWidth: 500,
              margin: '0 auto 40px',
              position: 'relative',
              zIndex: 20,
            }}
          >
            <SearchBar
              value=""
              onChange={handleSearch}
              placeholder="Search for 'cyberpunk tokyo'..."
              large
            />
          </div>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              size="lg"
              className="btn-glow-primary"
              onClick={() => navigate('/gallery')}
              icon={<FiArrowRight />}
            >
              Explore Gallery
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onOpenCinema}
            >
              🎬 Ambient Cinema
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating UI Elements (Parallax) */}
      <motion.div
        className="hidden lg:block"
        style={{
          position: 'absolute',
          left: '10%',
          top: '30%',
          y: y2,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <div className="glass" style={{ padding: '12px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#22C55E20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.2rem' }}>🌿</span>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Popular</p>
            <p style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>Nature</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="hidden lg:block"
        style={{
          position: 'absolute',
          right: '12%',
          bottom: '25%',
          y: y2,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <div className="glass" style={{ padding: '12px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F59E0B20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.2rem' }}>✈️</span>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Trending</p>
            <p style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>Travel</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
