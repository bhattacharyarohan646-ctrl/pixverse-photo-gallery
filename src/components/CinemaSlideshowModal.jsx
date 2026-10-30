import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiPlay, FiPause, FiChevronLeft, FiChevronRight,
  FiVolume2, FiVolumeX, FiMaximize, FiMinimize,
  FiMusic, FiCompass, FiCloudRain, FiWind, FiCoffee,
  FiCamera, FiUser, FiSliders, FiFilm, FiGrid
} from 'react-icons/fi';
import { soundscape } from '../utils/audioSynth';
import { photos as FALLBACK_PHOTOS } from '../data/photos';

const SOUNDSCAPES = [
  { id: 'rain', label: 'Rainy Cafe', icon: <FiCloudRain /> },
  { id: 'waves', label: 'Ocean Waves', icon: <FiWind /> },
  { id: 'lofi', label: 'Lo-Fi Chill', icon: <FiCoffee /> },
  { id: 'forest', label: 'Forest Breeze', icon: <FiCompass /> },
];

export default function CinemaSlideshowModal({ isOpen, onClose, photos = [], initialIndex = 0 }) {
  // Use provided photos array or fallback if empty
  const activePhotos = (photos && photos.length > 0) ? photos : FALLBACK_PHOTOS;
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalSec, setIntervalSec] = useState(5);
  const [activeSound, setActiveSound] = useState(null);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [showControls, setShowControls] = useState(true);
  const [showFilmstrip, setShowFilmstrip] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const hideControlsTimer = useRef(null);

  // Sync initial index when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const validIndex = (initialIndex >= 0 && initialIndex < activePhotos.length) ? initialIndex : 0;
      setCurrentIndex(validIndex);
      setIsPlaying(true);
      setImgError(false);
    } else {
      document.body.style.overflow = '';
      soundscape.stop();
      setActiveSound(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex, activePhotos.length]);

  // Slideshow advance
  const nextSlide = useCallback(() => {
    if (activePhotos.length === 0) return;
    setImgError(false);
    setCurrentIndex(prev => (prev + 1) % activePhotos.length);
  }, [activePhotos.length]);

  const prevSlide = useCallback(() => {
    if (activePhotos.length === 0) return;
    setImgError(false);
    setCurrentIndex(prev => (prev - 1 + activePhotos.length) % activePhotos.length);
  }, [activePhotos.length]);

  // Autoplay timer
  useEffect(() => {
    if (!isOpen || !isPlaying || activePhotos.length <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(nextSlide, intervalSec * 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, intervalSec, activePhotos.length, nextSlide]);

  // Preload upcoming photo
  useEffect(() => {
    if (!isOpen || activePhotos.length <= 1) return;
    const nextIdx = (currentIndex + 1) % activePhotos.length;
    const nextPhoto = activePhotos[nextIdx];
    if (nextPhoto) {
      const preloadImg = new Image();
      preloadImg.src = nextPhoto.imgUrl || nextPhoto.fullUrl || nextPhoto.thumbUrl;
    }
  }, [currentIndex, isOpen, activePhotos]);

  // Ambient soundscape control
  const toggleSound = (soundId) => {
    if (activeSound === soundId) {
      soundscape.stop();
      setActiveSound(null);
    } else {
      try {
        soundscape.play(soundId);
        soundscape.setVolume(soundVolume);
        setActiveSound(soundId);
      } catch (err) {
        console.warn('Soundscape play error:', err);
      }
    }
  };

  const handleVolumeChange = (v) => {
    const val = Number(v);
    setSoundVolume(val);
    soundscape.setVolume(val);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying && !showFilmstrip) {
        setShowControls(false);
      }
    }, 4500);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const currentPhoto = activePhotos[currentIndex] || activePhotos[0] || {};
  const photoUrl = imgError
    ? `https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80`
    : (currentPhoto.imgUrl || currentPhoto.fullUrl || currentPhoto.thumbUrl || currentPhoto.rawUrl || `https://picsum.photos/seed/cinema${currentIndex}/1200/800`);

  const modalContent = (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={() => setShowControls(true)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: '#04060A',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* ── 1. AMBIENT BACKGROUND GLOW BACKDROP ── */}
      <div
        key={`bg-${currentIndex}`}
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '120%',
          height: '120%',
          backgroundImage: `url(${photoUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(60px) brightness(0.35) saturate(1.6)',
          transform: 'scale(1.15)',
          transition: 'background-image 0.8s ease',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Dark vignette gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(4,6,10,0.2) 0%, rgba(4,6,10,0.85) 100%)',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />

      {/* ── 2. CENTERPIECE MASTER PHOTO WITH KEN BURNS MOTION ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '70px 40px 100px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <div
          key={`film-${currentIndex}`}
          className="cinema-kenburns"
          style={{
            maxWidth: '90vw',
            maxHeight: '82vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 25px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.12)'
          }}
        >
          <img
            src={photoUrl}
            alt={currentPhoto.title || 'Masterpiece'}
            onError={() => setImgError(true)}
            style={{
              maxWidth: '90vw',
              maxHeight: '82vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              borderRadius: 20,
            }}
          />
        </div>
      </div>

      {/* ── 3. OVERLAY HUD CONTROLS ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 32px',
          pointerEvents: 'none',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: showControls ? 'auto' : 'none' }}>
          {/* Badge */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(24px)',
            padding: '8px 20px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: isPlaying ? '#22C55E' : '#EAB308', boxShadow: `0 0 10px ${isPlaying ? '#22C55E' : '#EAB308'}` }} />
            <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.06em' }}>
              AMBIENT CINEMA
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: 4 }}>
              {currentIndex + 1} / {activePhotos.length}
            </span>
          </div>

          {/* Ambience Audio Synthesizer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(24px)',
            padding: '6px 16px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <FiMusic color="#C084FC" size={16} />
            <span style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginRight: 2 }}>Soundscape:</span>
            
            {SOUNDSCAPES.map(s => {
              const isActive = activeSound === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSound(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 999,
                    border: 'none',
                    background: isActive ? '#8B5CF6' : 'rgba(255,255,255,0.08)',
                    color: isActive ? '#fff' : '#cbd5e1',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? '0 0 16px rgba(139,92,246,0.6)' : 'none'
                  }}
                >
                  {s.icon} {s.label}
                </button>
              );
            })}

            {activeSound && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 6, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 8 }}>
                <FiVolume2 color="#94a3b8" size={14} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={e => handleVolumeChange(e.target.value)}
                  style={{ width: 64, accentColor: '#8B5CF6', cursor: 'pointer' }}
                  title="Ambience Volume"
                />
              </div>
            )}
          </div>

          {/* Right Actions: Filmstrip, Fullscreen, Close */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowFilmstrip(!showFilmstrip)}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: showFilmstrip ? '#3B82F6' : 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Toggle Filmstrip Grid"
            >
              <FiGrid size={18} />
            </button>

            <button
              onClick={toggleFullscreen}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
            </button>

            <button
              onClick={onClose}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Exit Cinema Mode (Esc)"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* MIDDLE CHEVRONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: showControls ? 'auto' : 'none' }}>
          <button
            onClick={prevSlide}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
              transition: 'transform 0.2s, background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FiChevronLeft size={32} />
          </button>

          <button
            onClick={nextSlide}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
              transition: 'transform 0.2s, background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FiChevronRight size={32} />
          </button>
        </div>

        {/* BOTTOM SECTION */}
        <div style={{ pointerEvents: showControls ? 'auto' : 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Filmstrip drawer (if enabled) */}
          {showFilmstrip && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(24px)',
              padding: 12,
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
            }}>
              {activePhotos.map((p, idx) => (
                <div
                  key={p.id || idx}
                  onClick={() => { setCurrentIndex(idx); setImgError(false); }}
                  style={{
                    width: 70,
                    height: 50,
                    borderRadius: 10,
                    overflow: 'hidden',
                    flexShrink: 0,
                    cursor: 'pointer',
                    border: `2px solid ${currentIndex === idx ? '#3B82F6' : 'rgba(255,255,255,0.1)'}`,
                    opacity: currentIndex === idx ? 1 : 0.6,
                    transform: currentIndex === idx ? 'scale(1.06)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <img
                    src={p.thumbUrl || p.imgUrl || p.fullUrl}
                    alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Info Card & Playback Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {/* Metadata Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(24px)',
              padding: '16px 24px',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.15)',
              maxWidth: 500,
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
            }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(59,130,246,0.25)',
                color: '#60A5FA',
                border: '1px solid rgba(59,130,246,0.4)'
              }}>
                {currentPhoto.category || 'Masterpiece'}
              </span>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px' }}>
                {currentPhoto.title || 'Untitled'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                Captured by <strong style={{ color: '#fff' }}>{currentPhoto.photographer || 'Creator'}</strong> • {currentPhoto.camera || 'High Definition'}
              </p>
            </div>

            {/* Playback & Interval Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(24px)',
              padding: '12px 24px',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
            }}>
              {/* Play / Pause button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.5)',
                  transition: 'transform 0.15s'
                }}
                title="Play / Pause (Space)"
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isPlaying ? <FiPause size={22} /> : <FiPlay size={22} style={{ marginLeft: 2 }} />}
              </button>

              {/* Interval speed */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>Interval:</span>
                {[3, 5, 8, 12].map(sec => (
                  <button
                    key={sec}
                    onClick={() => setIntervalSec(sec)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: intervalSec === sec ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)',
                      color: intervalSec === sec ? '#60A5FA' : '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Global Ken Burns Zoom Animation Style */}
      <style>{`
        @keyframes cinemaZoom {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06) translate(1%, -1%);
          }
          100% {
            transform: scale(1);
          }
        }
        .cinema-kenburns {
          animation: cinemaZoom 16s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
