import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheck, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { extractPaletteFromImage } from '../utils/colorExtractor';
import { useToast } from '../context/ToastContext';

export default function ColorPaletteCard({ imageUrl, photoTitle }) {
  const [palette, setPalette] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedHex, setCopiedHex] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    if (imageUrl) {
      setLoading(true);
      extractPaletteFromImage(imageUrl, 5).then(colors => {
        if (active) {
          setPalette(colors);
          setLoading(false);
        }
      });
    }
    return () => { active = false; };
  }, [imageUrl]);

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    showToast({ message: `Color ${hex} copied to clipboard!`, type: 'success' });
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const searchByTone = (color) => {
    // Navigate to gallery with query or tone
    navigate(`/gallery?q=${encodeURIComponent(color.name.split(' ')[0])}`);
  };

  if (loading) {
    return (
      <div style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 12 }}>Extracting harmonic color palette...</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, height: 48 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shimmer" style={{ borderRadius: 10 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: 24,
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 24,
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎨</span> Harmonic Color Palette
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 2 }}>
            AI-extracted dominant tones. Click swatch to copy HEX code.
          </p>
        </div>
      </div>

      {/* Color Swatches Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10, marginBottom: 16 }}>
        {palette.map((c, idx) => {
          const isCopied = copiedHex === c.hex;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => copyToClipboard(c.hex)}
              style={{
                background: c.hex,
                borderRadius: 14,
                padding: '12px 8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 85,
                boxShadow: `0 6px 20px ${c.hex}33`,
                border: '1px solid rgba(255,255,255,0.15)',
                position: 'relative',
                transition: 'box-shadow 0.2s',
              }}
              title={`Click to copy ${c.hex}`}
            >
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: c.isDark ? '#fff' : '#0f172a',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: c.isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.4)',
                padding: '2px 6px',
                borderRadius: 6,
                backdropFilter: 'blur(4px)',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {c.name}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: c.isDark ? '#fff' : '#0f172a',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: c.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)',
                padding: '3px 8px',
                borderRadius: 999,
                fontFamily: 'monospace'
              }}>
                {isCopied ? <FiCheck size={11} color="#22c55e" /> : <FiCopy size={10} />}
                <span>{c.hex}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search by matching mood */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Explore Tones:</span>
        {palette.slice(0, 3).map((c, i) => (
          <button
            key={i}
            onClick={() => searchByTone(c)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.72rem',
              color: '#94a3b8',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '4px 10px',
              borderRadius: 999,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = c.hex;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.hex }} />
            {c.name} photos
          </button>
        ))}
      </div>
    </div>
  );
}
