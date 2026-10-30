import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiSliders, FiRotateCw, FiRepeat, FiDownload,
  FiRefreshCw, FiEye, FiCheck, FiCrop, FiZap, FiLayers
} from 'react-icons/fi';
import { useToast } from '../context/ToastContext';
import { useDownloads } from '../context/DownloadsContext';

const PRESETS = [
  {
    id: 'original',
    name: 'Raw Original',
    icon: '✨',
    settings: { brightness: 100, contrast: 100, saturate: 100, sepia: 0, grayscale: 0, blur: 0, hue: 0, warmth: 0, vignette: false }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    icon: '🌆',
    settings: { brightness: 110, contrast: 140, saturate: 180, sepia: 0, grayscale: 0, blur: 0, hue: 320, warmth: -20, vignette: true }
  },
  {
    id: 'vintage',
    name: 'Vintage 1977',
    icon: '🎞️',
    settings: { brightness: 105, contrast: 90, saturate: 85, sepia: 40, grayscale: 0, blur: 0, hue: 10, warmth: 35, vignette: true }
  },
  {
    id: 'noir',
    name: 'Moody Noir',
    icon: '🖤',
    settings: { brightness: 95, contrast: 150, saturate: 0, sepia: 0, grayscale: 100, blur: 0, hue: 0, warmth: 0, vignette: true }
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    icon: '🌅',
    settings: { brightness: 108, contrast: 115, saturate: 140, sepia: 25, grayscale: 0, blur: 0, hue: 350, warmth: 45, vignette: false }
  },
  {
    id: 'emerald',
    name: 'Emerald Cinema',
    icon: '🌲',
    settings: { brightness: 102, contrast: 125, saturate: 115, sepia: 15, grayscale: 0, blur: 0, hue: 140, warmth: -15, vignette: true }
  },
  {
    id: 'pastel',
    name: 'Pastel Dream',
    icon: '🍬',
    settings: { brightness: 120, contrast: 85, saturate: 90, sepia: 10, grayscale: 0, blur: 0, hue: 15, warmth: 10, vignette: false }
  },
  {
    id: 'hdr',
    name: 'Crisp HDR',
    icon: '💎',
    settings: { brightness: 105, contrast: 135, saturate: 135, sepia: 0, grayscale: 0, blur: 0, hue: 0, warmth: 5, vignette: false }
  },
];

const ASPECT_RATIOS = [
  { label: 'Original', ratio: null },
  { label: '1:1 Square', ratio: '1 / 1' },
  { label: '16:9 Cinema', ratio: '16 / 9' },
  { label: '4:5 Social', ratio: '4 / 5' },
  { label: '9:16 Story', ratio: '9 / 16' },
];

export default function PhotoStudioModal({ isOpen, onClose, photo }) {
  const [activeTab, setActiveTab] = useState('filters'); // 'presets' | 'filters' | 'crop'
  const [activePreset, setActivePreset] = useState('original');
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);
  
  // Sliders
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [blur, setBlur] = useState(0);
  const [hue, setHue] = useState(0);
  const [warmth, setWarmth] = useState(0);
  const [vignette, setVignette] = useState(false);

  // Before/After comparison slider
  const [compareMode, setCompareMode] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('image/png');

  const containerRef = useRef(null);
  const { showToast } = useToast();
  const { recordDownload } = useDownloads();

  // Reset when new photo opens
  useEffect(() => {
    if (isOpen) {
      resetAll();
    }
  }, [isOpen, photo]);

  const resetAll = () => {
    setActivePreset('original');
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspectRatio(null);
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setSepia(0);
    setGrayscale(0);
    setBlur(0);
    setHue(0);
    setWarmth(0);
    setVignette(false);
    setCompareMode(false);
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    const s = preset.settings;
    setBrightness(s.brightness);
    setContrast(s.contrast);
    setSaturate(s.saturate);
    setSepia(s.sepia);
    setGrayscale(s.grayscale);
    setBlur(s.blur);
    setHue(s.hue);
    setWarmth(s.warmth);
    setVignette(s.vignette);
  };

  // Build filter CSS string
  const getFilterStyle = () => {
    let warmthFilter = '';
    if (warmth > 0) {
      warmthFilter = `sepia(${warmth * 0.4}%)`;
    } else if (warmth < 0) {
      warmthFilter = `hue-rotate(${warmth * 0.8}deg)`;
    }
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${sepia}%) grayscale(${grayscale}%) blur(${blur}px) hue-rotate(${hue}deg) ${warmthFilter}`;
  };

  const getTransformStyle = () => {
    const scaleX = flipH ? -1 : 1;
    const scaleY = flipV ? -1 : 1;
    return `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`;
  };

  // Render to canvas and download edited photo
  const handleExport = async () => {
    if (!photo) return;
    setExporting(true);
    showToast({ message: 'Rendering high-res photo studio export...', type: 'info' });

    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = photo.rawUrl || photo.fullUrl || photo.imgUrl;

      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set dimensions
      let outWidth = img.naturalWidth || 1920;
      let outHeight = img.naturalHeight || 1080;

      // Handle 90/270 degree rotation dimension swap
      const isSwapped = (rotation % 180 !== 0);
      canvas.width = isSwapped ? outHeight : outWidth;
      canvas.height = isSwapped ? outWidth : outHeight;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Apply Canvas filters
      ctx.filter = getFilterStyle();
      ctx.drawImage(img, -outWidth / 2, -outHeight / 2, outWidth, outHeight);

      // Apply vignette if enabled
      if (vignette) {
        ctx.filter = 'none';
        const gradient = ctx.createRadialGradient(
          0, 0, Math.min(outWidth, outHeight) * 0.3,
          0, 0, Math.max(outWidth, outHeight) * 0.7
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = gradient;
        ctx.fillRect(-outWidth / 2, -outHeight / 2, outWidth, outHeight);
      }

      ctx.restore();

      const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
      const filename = `${photo.title.replace(/\s+/g, '-').toLowerCase()}-studio-${activePreset}.${ext}`;

      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Blob generation failed');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        recordDownload(photo, `Studio ${activePreset.toUpperCase()} (${ext.toUpperCase()})`, `${canvas.width}×${canvas.height}`);
        showToast({ message: '✨ Studio masterpiece exported!', type: 'success' });
        setExporting(false);
      }, exportFormat, 0.95);
    } catch (err) {
      console.error('Studio export failed:', err);
      showToast({ message: 'Studio export failed. Downloading standard version.', type: 'error' });
      setExporting(false);
    }
  };

  if (!isOpen || !photo) return null;

  return createPortal(
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(5, 8, 16, 0.96)',
        backdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Top Navigation Bar */}
        <div style={{
          height: 64, borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', background: 'rgba(15, 23, 42, 0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiZap color="#fff" size={18} />
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                PixVerse Creative Studio
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>
                {photo.title} • Live Canvas Grading & Preset Engine
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Compare Toggle */}
            <button
              onClick={() => setCompareMode(!compareMode)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10,
                background: compareMode ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${compareMode ? '#3B82F6' : 'rgba(255,255,255,0.1)'}`,
                color: compareMode ? '#60A5FA' : '#cbd5e1',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <FiLayers size={15} />
              {compareMode ? 'Exit Comparison' : 'Before / After'}
            </button>

            {/* Reset */}
            <button
              onClick={resetAll}
              title="Reset All Adjustments"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <FiRefreshCw size={14} /> Reset
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer'
              }}
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Main Studio Body */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', overflow: 'hidden' }}>
          
          {/* ── Center Stage: Image Canvas Preview ──────────────── */}
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 32,
              background: '#090D16',
              overflow: 'hidden',
              userSelect: 'none'
            }}
          >
            {/* Aspect Ratio Frame Wrapper */}
            <div style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '80vh',
              aspectRatio: aspectRatio || 'auto',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#111'
            }}>
              {/* Unmodified base (for before/after comparison) */}
              {compareMode && (
                <div style={{
                  position: 'absolute', inset: 0, overflow: 'hidden',
                  zIndex: 2,
                  width: `${sliderPos}%`,
                  borderRight: '2px solid #fff',
                  boxShadow: '2px 0 10px rgba(0,0,0,0.5)'
                }}>
                  <img
                    src={photo.imgUrl}
                    alt="Original"
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'contain',
                      transform: getTransformStyle(),
                      maxWidth: 'none',
                      minWidth: containerRef.current ? containerRef.current.clientWidth * 0.7 : 600
                    }}
                  />
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                    color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                    padding: '4px 10px', borderRadius: 999
                  }}>
                    ORIGINAL
                  </div>
                </div>
              )}

              {/* Filtered Active Image */}
              <img
                src={photo.imgUrl}
                alt="Studio Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  filter: getFilterStyle(),
                  transform: getTransformStyle(),
                  transition: 'filter 0.1s ease, transform 0.2s ease',
                  display: 'block'
                }}
              />

              {/* Vignette Overlay */}
              {vignette && (
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) 100%)'
                }} />
              )}

              {compareMode && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(59,130,246,0.8)', backdropFilter: 'blur(6px)',
                  color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                  padding: '4px 10px', borderRadius: 999, zIndex: 1
                }}>
                  EDITED
                </div>
              )}
            </div>

            {/* Split Comparison Slider Handle */}
            {compareMode && (
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={e => setSliderPos(Number(e.target.value))}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '60%',
                  zIndex: 10,
                  cursor: 'ew-resize',
                  opacity: 0.8
                }}
              />
            )}
          </div>

          {/* ── Right Panel: Controls & Sliders ───────────────── */}
          <div style={{
            background: '#0F172A',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            {/* Mode Switcher Tabs */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              borderBottom: '1px solid rgba(255,255,255,0.08)', padding: 8, gap: 4
            }}>
              {[
                { id: 'presets', label: 'Presets', icon: <FiZap /> },
                { id: 'filters', label: 'Sliders', icon: <FiSliders /> },
                { id: 'crop', label: 'Transform', icon: <FiCrop /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px 8px', borderRadius: 8, border: 'none',
                    background: activeTab === tab.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: activeTab === tab.id ? '#60A5FA' : '#94a3b8',
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Panel Tab Content */}
            <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
              
              {/* ── PRESETS TAB ── */}
              {activeTab === 'presets' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {PRESETS.map(preset => {
                    const isSelected = activePreset === preset.id;
                    return (
                      <motion.div
                        key={preset.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => applyPreset(preset)}
                        style={{
                          padding: '14px 12px',
                          borderRadius: 14,
                          background: isSelected ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isSelected ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '1.4rem' }}>{preset.icon}</span>
                          {isSelected && <FiCheck color="#3B82F6" size={16} />}
                        </div>
                        <span style={{ color: isSelected ? '#fff' : '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
                          {preset.name}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* ── SLIDERS TAB ── */}
              {activeTab === 'filters' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <StudioSlider label="Brightness" value={brightness} min={30} max={180} unit="%" onChange={setBrightness} />
                  <StudioSlider label="Contrast" value={contrast} min={50} max={200} unit="%" onChange={setContrast} />
                  <StudioSlider label="Saturation" value={saturate} min={0} max={250} unit="%" onChange={setSaturate} />
                  <StudioSlider label="Color Warmth" value={warmth} min={-50} max={50} unit="" onChange={setWarmth} />
                  <StudioSlider label="Hue Shift" value={hue} min={-180} max={180} unit="°" onChange={setHue} />
                  <StudioSlider label="Sepia Tone" value={sepia} min={0} max={100} unit="%" onChange={setSepia} />
                  <StudioSlider label="B&W Grayscale" value={grayscale} min={0} max={100} unit="%" onChange={setGrayscale} />
                  <StudioSlider label="Lens Blur" value={blur} min={0} max={10} unit="px" onChange={setBlur} />

                  {/* Vignette Toggle */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <div>
                      <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>Vignette Edge</p>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>Darken lens edges</p>
                    </div>
                    <button
                      onClick={() => setVignette(!vignette)}
                      style={{
                        width: 44, height: 24, borderRadius: 999, border: 'none',
                        background: vignette ? '#3B82F6' : 'rgba(255,255,255,0.15)',
                        cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3, left: vignette ? 23 : 3,
                        transition: 'left 0.2s'
                      }} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── TRANSFORM TAB ── */}
              {activeTab === 'crop' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Aspect Ratios */}
                  <div>
                    <h5 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>Aspect Framing</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {ASPECT_RATIOS.map(ar => (
                        <button
                          key={ar.label}
                          onClick={() => setAspectRatio(ar.ratio)}
                          style={{
                            padding: '10px', borderRadius: 10,
                            border: `1px solid ${aspectRatio === ar.ratio ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
                            background: aspectRatio === ar.ratio ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                            color: aspectRatio === ar.ratio ? '#60A5FA' : '#cbd5e1',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          {ar.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rotate & Flip */}
                  <div>
                    <h5 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>Orientation</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <button
                        onClick={() => setRotation(r => (r + 90) % 360)}
                        style={{
                          padding: '12px 8px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff', fontSize: '0.8rem', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                        }}
                      >
                        <FiRotateCw size={18} /> +90° Rotate
                      </button>
                      <button
                        onClick={() => setFlipH(f => !f)}
                        style={{
                          padding: '12px 8px', borderRadius: 10,
                          background: flipH ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${flipH ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
                          color: flipH ? '#60A5FA' : '#fff', fontSize: '0.8rem', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                        }}
                      >
                        <FiRepeat size={18} /> Flip Horiz
                      </button>
                      <button
                        onClick={() => setFlipV(f => !f)}
                        style={{
                          padding: '12px 8px', borderRadius: 10,
                          background: flipV ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${flipV ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
                          color: flipV ? '#60A5FA' : '#fff', fontSize: '0.8rem', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                        }}
                      >
                        <FiRepeat size={18} style={{ transform: 'rotate(90deg)' }} /> Flip Vert
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Export Bottom Section */}
            <div style={{
              padding: 20, borderTop: '1px solid rgba(255,255,255,0.08)',
              background: '#0B0F19', display: 'flex', flexDirection: 'column', gap: 12
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {['image/png', 'image/jpeg', 'image/webp'].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    style={{
                      flex: 1, padding: '6px 0', borderRadius: 8,
                      border: `1px solid ${exportFormat === fmt ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
                      background: exportFormat === fmt ? 'rgba(59,130,246,0.2)' : 'transparent',
                      color: exportFormat === fmt ? '#60A5FA' : '#94a3b8',
                      fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    {fmt.split('/')[1].toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExport}
                disabled={exporting}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: exporting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
                  transition: 'transform 0.15s'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <FiDownload size={18} />
                {exporting ? 'Processing High-Res Export...' : 'Export Studio Masterpiece'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

function StudioSlider({ label, value, min, max, unit, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 500 }}>{label}</label>
        <span style={{ color: '#60A5FA', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace' }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#3B82F6',
          cursor: 'pointer'
        }}
      />
    </div>
  );
}
