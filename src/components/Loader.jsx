import { motion } from 'framer-motion';

/**
 * Animated loader / spinner
 * @param {boolean} fullScreen - render as full-screen overlay
 */
export default function Loader({ fullScreen = false }) {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
      {/* Dual-ring spinner */}
      <div style={{ position: 'relative', width: 52, height: 52 }}>
        <motion.div
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(59,130,246,0.15)',
            borderTopColor: '#3B82F6',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          style={{
            position: 'absolute', inset: 8,
            borderRadius: '50%',
            border: '2px solid rgba(139,92,246,0.15)',
            borderBottomColor: '#8B5CF6',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <motion.span
        style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, letterSpacing: '0.08em' }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        Loading…
      </motion.span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0,
          background: '#0B0F19',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <motion.div
            className="gradient-text font-poppins"
            style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', fontFamily: 'Poppins, sans-serif' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            PixVerse
          </motion.div>
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
      {spinner}
    </div>
  );
}
