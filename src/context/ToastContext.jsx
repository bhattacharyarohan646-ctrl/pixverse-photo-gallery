/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { toastVariants } from '../styles/animations';

const ToastContext = createContext(null);

const ICONS = {
  success: <FiCheckCircle size={18} style={{ color: '#22C55E' }} />,
  error:   <FiAlertCircle size={18} style={{ color: '#EF4444' }} />,
  info:    <FiInfo        size={18} style={{ color: '#60A5FA' }} />,
};

const BORDER_COLORS = {
  success: 'rgba(34,197,94,0.3)',
  error:   'rgba(239,68,68,0.3)',
  info:    'rgba(96,165,250,0.3)',
};

let uid = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ message, type = 'info', duration = 3200 }) => {
    const id = ++uid;
    setToasts((prev) => [...prev, { id, message, type }]);
    const timer = setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      duration
    );
    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          pointerEvents: 'none',
          maxWidth: '400px',
        }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              variants={toastVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: '14px',
                border: `1px solid ${BORDER_COLORS[toast.type]}`,
                background: 'rgba(17,24,39,0.97)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                minWidth: '280px',
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '1px' }}>
                {ICONS[toast.type]}
              </div>
              <span
                style={{
                  fontSize: '0.875rem',
                  color: '#e2e8f0',
                  fontWeight: 500,
                  flex: 1,
                  lineHeight: 1.4,
                }}
              >
                {toast.message}
              </span>
              <button
                onClick={() => dismiss(toast.id)}
                style={{
                  color: '#64748b',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  marginTop: '1px',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                <FiX size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: () => {},
    };
  }
  return ctx;
};
