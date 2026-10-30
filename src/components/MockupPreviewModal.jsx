import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiSmartphone, FiMonitor, FiImage, FiDownload,
  FiClock, FiWifi, FiBattery, FiSun, FiCamera,
  FiMaximize, FiCompass, FiMusic, FiTerminal
} from 'react-icons/fi';
import { downloadImage } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import { useDownloads } from '../context/DownloadsContext';

export default function MockupPreviewModal({ isOpen, onClose, photo }) {
  const [device, setDevice] = useState('mobile'); // 'mobile' | 'desktop' | 'room'
  const { showToast } = useToast();
  const { recordDownload } = useDownloads();

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleDownloadWallpaper = async (type) => {
    if (!photo) return;
    showToast({ message: `Preparing ${type} wallpaper...`, type: 'info' });
    const url = photo.rawUrl || photo.fullUrl || photo.imgUrl;
    const ok = await downloadImage(url, `${photo.title}-${type}-wallpaper`);
    if (ok) {
      recordDownload(photo, `${type.toUpperCase()} Wallpaper`);
      showToast({ message: `✅ ${type} wallpaper downloaded!`, type: 'success' });
    } else {
      showToast({ message: 'Download failed', type: 'error' });
    }
  };

  if (!isOpen || !photo) return null;

  return createPortal(
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(5, 8, 16, 0.95)',
        backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          height: 68, borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', background: 'rgba(15, 23, 42, 0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #10B981, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiSmartphone color="#fff" size={18} />
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                Live Wallpaper & Mockup Previewer
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>
                {photo.title} • Realistic Device Environment Simulations
              </p>
            </div>
          </div>

          {/* Device Switcher */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.06)',
            borderRadius: 12, padding: 4, border: '1px solid rgba(255,255,255,0.08)'
          }}>
            {[
              { id: 'mobile', label: 'Phone Lockscreen', icon: <FiSmartphone /> },
              { id: 'desktop', label: 'Mac Desktop', icon: <FiMonitor /> },
              { id: 'room', label: 'Living Room Gallery', icon: <FiImage /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDevice(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: device === tab.id ? '#3B82F6' : 'transparent',
                  color: device === tab.id ? '#fff' : '#94a3b8',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

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

        {/* Center Stage Preview */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, overflow: 'hidden', position: 'relative'
        }}>
          
          {/* ── 1. SMARTPHONE LOCKSCREEN MOCKUP ── */}
          {device === 'mobile' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                width: 320,
                height: 640,
                borderRadius: 48,
                border: '10px solid #1E293B',
                boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'hidden',
                background: '#000',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Wallpaper background */}
              <img
                src={photo.imgUrl}
                alt="Mobile wallpaper"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover'
                }}
              />

              {/* Dynamic Island */}
              <div style={{
                position: 'absolute', top: 12, left: '50%',
                transform: 'translateX(-50%)',
                width: 100, height: 26,
                background: '#000', borderRadius: 20,
                zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 8px'
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0a192f' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#052e16' }} />
              </div>

              {/* Status bar top */}
              <div style={{
                position: 'relative', zIndex: 10,
                display: 'flex', justifyContent: 'space-between',
                padding: '16px 24px 0', color: '#fff', fontSize: '0.8rem', fontWeight: 600
              }}>
                <span>9:41</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <FiWifi size={13} />
                  <FiBattery size={15} />
                </div>
              </div>

              {/* Lock screen Time & Widgets */}
              <div style={{
                position: 'relative', zIndex: 10,
                textAlign: 'center', marginTop: 24, textShadow: '0 2px 20px rgba(0,0,0,0.8)'
              }}>
                <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500, margin: 0, opacity: 0.9 }}>
                  {currentDate}
                </p>
                <h1 style={{ color: '#fff', fontSize: '4.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {currentTime}
                </h1>
                
                {/* Weather Widget */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
                  padding: '6px 14px', borderRadius: 999, marginTop: 12,
                  color: '#fff', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.15)'
                }}>
                  <span>☀️ 24°C • Sunny</span>
                </div>
              </div>

              {/* Lockscreen Bottom Controls */}
              <div style={{
                position: 'relative', zIndex: 10,
                padding: '0 28px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <FiSun size={18} />
                </div>

                <div style={{
                  width: 120, height: 4, background: '#fff',
                  borderRadius: 999, opacity: 0.8, marginBottom: 4
                }} />

                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <FiCamera size={18} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── 2. DESKTOP / MACBOOK WORKSPACE MOCKUP ── */}
          {device === 'desktop' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                width: '85%',
                maxWidth: 960,
                aspectRatio: '16 / 10',
                borderRadius: 18,
                border: '10px solid #1e293b',
                boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'hidden',
                background: '#000',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <img
                src={photo.rawUrl || photo.fullUrl || photo.imgUrl}
                alt="Desktop wallpaper"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover'
                }}
              />

              {/* macOS Menu Bar */}
              <div style={{
                position: 'relative', zIndex: 10,
                height: 28, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px', color: '#fff', fontSize: '0.75rem', fontWeight: 500,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}></span>
                  <span style={{ fontWeight: 700 }}>Finder</span>
                  <span style={{ opacity: 0.8 }}>File</span>
                  <span style={{ opacity: 0.8 }}>Edit</span>
                  <span style={{ opacity: 0.8 }}>View</span>
                  <span style={{ opacity: 0.8 }}>Window</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <FiWifi size={13} />
                  <FiBattery size={14} />
                  <span>{currentDate.split(',')[0]} {currentTime}</span>
                </div>
              </div>

              {/* macOS Bottom Dock */}
              <div style={{
                position: 'relative', zIndex: 10,
                margin: '0 auto 12px',
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 16,
                padding: '6px 14px',
                display: 'flex', gap: 12, alignItems: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
              }}>
                {[
                  { icon: <FiCompass size={20} color="#38bdf8" />, bg: '#0284c7' },
                  { icon: <FiImage size={20} color="#fbbf24" />, bg: '#d97706' },
                  { icon: <FiMusic size={20} color="#f43f5e" />, bg: '#e11d48' },
                  { icon: <FiTerminal size={20} color="#4ade80" />, bg: '#16a34a' },
                ].map((app, i) => (
                  <div
                    key={i}
                    style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: 'rgba(0,0,0,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      cursor: 'pointer'
                    }}
                  >
                    {app.icon}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── 3. LIVING ROOM FRAMED WALL ART MOCKUP ── */}
          {device === 'room' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                width: '90%',
                maxWidth: 900,
                height: 520,
                borderRadius: 24,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(to bottom, #1E293B 0%, #0F172A 100%)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40
              }}
            >
              {/* Minimalist Wall Texture & Top Spotlights */}
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 300, height: 200,
                background: 'radial-gradient(ellipse at top, rgba(255,237,213,0.2) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              {/* Framed Canvas Art */}
              <div style={{
                padding: 16,
                background: '#0B0F19',
                borderRadius: 8,
                boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 0 3px #334155, 0 10px 20px rgba(0,0,0,0.4)',
                position: 'relative',
                zIndex: 5,
                maxWidth: '65%',
                maxHeight: '70%'
              }}>
                <div style={{
                  padding: 12,
                  background: '#F8FAFC',
                  borderRadius: 2
                }}>
                  <img
                    src={photo.imgUrl}
                    alt="Framed artwork"
                    style={{
                      maxHeight: 260,
                      maxWidth: '100%',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </div>
              </div>

              {/* Sofa silhouette baseline */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: 70, background: '#0B0F19', borderTop: '4px solid #1E293B',
                display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}>
                <div style={{ width: '80%', height: 30, background: '#1E293B', borderRadius: '12px 12px 0 0' }} />
              </div>
            </motion.div>
          )}

        </div>

        {/* Bottom Actions Bar */}
        <div style={{
          height: 76, borderTop: '1px solid rgba(255,255,255,0.08)',
          background: '#0F172A', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 32px'
        }}>
          <div>
            <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
              Tailored High-Definition Wallpapers
            </p>
            <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>
              Original resolution: {photo.resolution || 'High Definition'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => handleDownloadWallpaper('Mobile (9:16)')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <FiSmartphone /> Download Mobile (9:16)
            </button>
            <button
              onClick={() => handleDownloadWallpaper('Desktop (16:9)')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 12,
                background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                border: 'none', boxShadow: '0 4px 16px rgba(16,185,129,0.3)'
              }}
            >
              <FiMonitor /> Download 4K Desktop
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
