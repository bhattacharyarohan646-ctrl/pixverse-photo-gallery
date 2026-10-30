import { motion } from 'framer-motion';
import {
  FiGrid, FiCamera, FiMapPin, FiCpu, FiCoffee,
  FiNavigation, FiHome, FiHeart, FiUser,
} from 'react-icons/fi';
import { CATEGORIES } from '../data/photos';

const ICONS = {
  All:          FiGrid,
  Nature:       FiCamera,
  Travel:       FiMapPin,
  Technology:   FiCpu,
  Food:         FiCoffee,
  Cars:         FiNavigation,
  Architecture: FiHome,
  Animals:      FiHeart,
  People:       FiUser,
};

const COLORS = {
  All:          '#3B82F6',
  Nature:       '#22C55E',
  Travel:       '#F59E0B',
  Technology:   '#6366F1',
  Food:         '#EF4444',
  Cars:         '#EC4899',
  Architecture: '#8B5CF6',
  Animals:      '#14B8A6',
  People:       '#F97316',
};

/**
 * Horizontal scrollable category filter pills
 * @param {string} active - currently active category
 * @param {Function} onChange - called with selected category
 */
export default function CategoryFilter({ active, onChange }) {
  return (
    <div
      className="hide-scrollbar"
      style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}
    >
      {CATEGORIES.map((cat) => {
        const Icon = ICONS[cat];
        const color = COLORS[cat];
        const isActive = active === cat;

        return (
          <motion.button
            key={cat}
            onClick={() => onChange(cat)}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 16px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: isActive
                ? `linear-gradient(135deg, ${color}22, ${color}0f)`
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isActive ? `${color}55` : 'rgba(255,255,255,0.07)'}`,
              color: isActive ? color : '#94a3b8',
              boxShadow: isActive ? `0 4px 18px ${color}22` : 'none',
            }}
          >
            <Icon size={14} />
            {cat}
          </motion.button>
        );
      })}
    </div>
  );
}
