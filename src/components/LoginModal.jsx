import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShield, FiHeart, FiDownload, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { modalVariants } from '../styles/animations';

export default function LoginModal({ isOpen, onClose }) {
  const { signInWithGoogle } = useAuth();
  const toastCtx = useToast();
  const showToast = toastCtx?.showToast || (({ message }) => alert(message));

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      showToast({ message: 'Signed in successfully with Google!', type: 'success' });
      onClose();
    } catch (err) {
      console.error(err);
      showToast({ message: 'Google Sign-In failed or was cancelled.', type: 'error' });
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
          }}
        />

        {/* Modal Content */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 440,
            background: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: 32,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            zIndex: 10,
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <FiX size={18} />
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <FiShield size={28} color="#60A5FA" />
            </div>
            <h2 className="font-poppins" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
              Sign In to PixVerse
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Connect with your Google Account via Firebase Authentication.
            </p>
          </div>

          {/* Features Checklist */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <FeatureRow icon={<FiHeart color="#F87171" />} text="Sync your favorite photos across devices" />
            <FeatureRow icon={<FiDownload color="#60A5FA" />} text="Access high-res original downloads" />
            <FeatureRow icon={<FiCheckCircle color="#34D399" />} text="Instant secure OAuth authentication" />
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '14px 24px',
              borderRadius: 14,
              background: '#ffffff',
              color: '#0F172A',
              fontSize: '1rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.15)';
            }}
          >
            <FcGoogle size={24} />
            <span>Continue with Google</span>
          </button>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', marginTop: 16 }}>
            Powered by Firebase Auth. No password required.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function FeatureRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>{icon}</div>
      <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500 }}>{text}</span>
    </div>
  );
}
