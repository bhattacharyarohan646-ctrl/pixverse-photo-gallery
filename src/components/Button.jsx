import { motion } from 'framer-motion';
import { buttonTap } from '../styles/animations';

/**
 * Reusable Button component
 * @param {'primary'|'ghost'|'outline'|'danger'|'success'} variant
 * @param {'sm'|'md'|'lg'|'xl'} size
 */

const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
  },
  ghost: {
    background: 'rgba(255,255,255,0.07)',
    color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  outline: {
    background: 'transparent',
    color: '#60A5FA',
    border: '1px solid rgba(59,130,246,0.5)',
  },
  danger: {
    background: 'rgba(239,68,68,0.1)',
    color: '#F87171',
    border: '1px solid rgba(239,68,68,0.3)',
  },
  success: {
    background: 'rgba(34,197,94,0.1)',
    color: '#4ADE80',
    border: '1px solid rgba(34,197,94,0.3)',
  },
};

const SIZES = {
  sm: { padding: '6px 14px',  fontSize: '0.75rem',  borderRadius: '10px' },
  md: { padding: '10px 20px', fontSize: '0.875rem', borderRadius: '12px' },
  lg: { padding: '13px 28px', fontSize: '1rem',     borderRadius: '14px' },
  xl: { padding: '16px 36px', fontSize: '1.125rem', borderRadius: '16px' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  icon,
  fullWidth = false,
  ...props
}) {
  const variantStyle = VARIANTS[variant] ?? VARIANTS.primary;
  const sizeStyle    = SIZES[size]    ?? SIZES.md;

  return (
    <motion.button
      type={type}
      whileTap={buttonTap}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        width: fullWidth ? '100%' : undefined,
        ...variantStyle,
        ...sizeStyle,
      }}
      {...props}
    >
      {icon && <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </motion.button>
  );
}
