import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowRight } from 'react-icons/fi';
import { pageTransition } from '../styles/animations';

export default function NotFound() {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        textAlign: 'center',
      }}
    >
      <div style={{ position: 'relative', zIndex: 10 }}>
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="font-space gradient-text"
          style={{ fontSize: 'clamp(6rem, 15vw, 12rem)', fontWeight: 900, lineHeight: 1, marginBottom: 20 }}
        >
          404
        </motion.h1>
        
        <h2 className="font-poppins" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Page Not Found
        </h2>
        
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: 400, margin: '0 auto 40px' }}>
          The photograph or page you're looking for seems to have been lost in the darkroom.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              padding: '14px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              color: '#fff', fontSize: '1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
            }}
          >
            <FiHome /> Return Home
          </Link>
          <Link
            to="/gallery"
            style={{
              padding: '14px 28px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0', fontSize: '1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            Browse Gallery <FiArrowRight />
          </Link>
        </div>
      </div>

      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vw', height: '80vw', maxWidth: 800, maxHeight: 800, background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 60%)', borderRadius: '50%' }} />
      </div>
    </motion.div>
  );
}
