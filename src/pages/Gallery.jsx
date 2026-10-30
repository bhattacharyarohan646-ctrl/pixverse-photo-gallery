import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiChevronDown, FiPlay, FiCheck } from 'react-icons/fi';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import GalleryGrid from '../components/GalleryGrid';
import CinemaSlideshowModal from '../components/CinemaSlideshowModal';
import { searchImages } from '../services/unsplash';
import { pageTransition } from '../styles/animations';

const ORIENTATION_OPTIONS = [
  { value: 'all', label: 'All Orientations' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'squarish', label: 'Square' },
];

const COLOR_FILTERS = [
  { id: 'all', name: 'All Tones', color: 'transparent', border: '#64748b' },
  { id: 'blue', name: 'Blue', color: '#3B82F6', border: '#3B82F6' },
  { id: 'green', name: 'Emerald', color: '#10B981', border: '#10B981' },
  { id: 'amber', name: 'Golden', color: '#F59E0B', border: '#F59E0B' },
  { id: 'red', name: 'Crimson', color: '#EF4444', border: '#EF4444' },
  { id: 'purple', name: 'Violet', color: '#8B5CF6', border: '#8B5CF6' },
  { id: 'black_and_white', name: 'Monochrome', color: '#334155', border: '#cbd5e1' },
];

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const catParam = searchParams.get('cat') || 'All';
  const orientParam = searchParams.get('orient') || 'all';
  const colorParam = searchParams.get('color') || 'all';

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSort, setShowSort] = useState(false);
  const [cinemaOpen, setCinemaOpen] = useState(false);
  
  const observer = useRef();
  
  // Debounce search input locally so we don't spam API while typing
  const [inputValue, setInputValue] = useState(qParam);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== qParam) {
        setSearchParams(prev => {
          if (inputValue) prev.set('q', inputValue);
          else prev.delete('q');
          return prev;
        }, { replace: true });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [inputValue, qParam, setSearchParams]);

  // Fetch photos whenever params change
  useEffect(() => {
    let active = true;
    const fetchPhotos = async () => {
      setLoading(true);
      setPage(1);
      
      let query = qParam;
      if (!query && catParam !== 'All') query = catParam;
      
      const filters = {};
      if (orientParam !== 'all') filters.orientation = orientParam;
      if (colorParam !== 'all') filters.color = colorParam;

      const res = await searchImages(query, 1, filters);
      
      if (active) {
        setPhotos(res.results);
        setTotalPages(res.totalPages || 1);
        setLoading(false);
      }
    };
    fetchPhotos();
    return () => { active = false; };
  }, [qParam, catParam, orientParam, colorParam]);

  // Infinite Scroll intersection observer
  const lastElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(async entries => {
      if (entries[0].isIntersecting && page < totalPages) {
        setLoadingMore(true);
        const nextPage = page + 1;
        
        let query = qParam;
        if (!query && catParam !== 'All') query = catParam;
        
        const filters = {};
        if (orientParam !== 'all') filters.orientation = orientParam;
        if (colorParam !== 'all') filters.color = colorParam;

        const res = await searchImages(query, nextPage, filters);
        
        setPhotos(prev => [...prev, ...res.results]);
        setPage(nextPage);
        setLoadingMore(false);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, page, totalPages, qParam, catParam, orientParam, colorParam]);

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // Handlers
  const handleSearch = (val) => setInputValue(val);

  const handleCategory = (cat) => {
    setSearchParams(prev => {
      if (cat !== 'All') prev.set('cat', cat);
      else prev.delete('cat');
      return prev;
    }, { replace: true });
  };

  const handleOrientation = (val) => {
    setSearchParams(prev => {
      if (val !== 'all') prev.set('orient', val);
      else prev.delete('orient');
      return prev;
    }, { replace: true });
    setShowSort(false);
  };

  const handleColor = (colId) => {
    setSearchParams(prev => {
      if (colId !== 'all') prev.set('color', colId);
      else prev.delete('color');
      return prev;
    }, { replace: true });
  };

  const currentSortLabel = ORIENTATION_OPTIONS.find(o => o.value === orientParam)?.label;

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" style={{ paddingTop: 90, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <h1 className="font-poppins" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                Discover <span className="gradient-text">Masterpieces</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
                Explore thousands of high-resolution visual art and photographies.
              </p>
            </div>

            {/* 🎬 Cinema Mode Launcher Button */}
            {photos.length > 0 && (
              <button
                onClick={() => setCinemaOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 22px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(139,92,246,0.3)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FiPlay size={18} /> Ambient Cinema Mode
              </button>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
            <div style={{ maxWidth: 640, width: '100%' }}>
              <SearchBar value={inputValue} onChange={handleSearch} />
            </div>

            {/* Sort Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSort(!showSort)}
                aria-label="Filter photos by orientation"
                aria-haspopup="listbox"
                aria-expanded={showSort}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 18px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <FiFilter size={16} color="#94a3b8" />
                <span className="hidden sm:inline">{currentSortLabel}</span>
                <FiChevronDown size={16} color="#94a3b8" style={{ transform: showSort ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>

              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: 8, width: 200, zIndex: 50,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                  }}
                >
                  {ORIENTATION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleOrientation(opt.value)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px',
                        borderRadius: 8, border: 'none', background: orientParam === opt.value ? 'rgba(59,130,246,0.15)' : 'transparent',
                        color: orientParam === opt.value ? '#60A5FA' : '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer'
                      }}
                      onMouseEnter={e => { if(orientParam !== opt.value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseLeave={e => { if(orientParam !== opt.value) e.currentTarget.style.background = 'transparent' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: 20 }}>
          <CategoryFilter active={catParam} onChange={handleCategory} />
        </div>

        {/* 🌈 Color Tone Filter Swatches */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          paddingBottom: 24, marginBottom: 24,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          overflowX: 'auto'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Color Palette:
          </span>
          {COLOR_FILTERS.map(cf => {
            const isSelected = colorParam === cf.id;
            return (
              <button
                key={cf.id}
                onClick={() => handleColor(cf.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 999,
                  background: isSelected ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSelected ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
                  color: isSelected ? '#fff' : '#94a3b8',
                  fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
                }}
              >
                {cf.id !== 'all' && (
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: cf.color, border: `1px solid ${cf.border}`
                  }} />
                )}
                {cf.name}
              </button>
            );
          })}
        </div>

        {/* Results Info */}
        {!loading && (
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 24 }}>
            {photos.length === 0 ? 'No photos found' : `Showing results`}
            {catParam !== 'All' && <span> in <span style={{ color: '#fff' }}>{catParam}</span></span>}
            {qParam && <span> matching "<span style={{ color: '#fff' }}>{qParam}</span>"</span>}
            {colorParam !== 'all' && <span> in tone <span style={{ color: '#60A5FA' }}>{colorParam}</span></span>}
          </p>
        )}

        {/* Gallery */}
        <GalleryGrid photos={photos} loading={loading} />
        
        {/* Infinite Scroll Trigger */}
        {!loading && photos.length > 0 && page < totalPages && (
          <div ref={lastElementRef} style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loadingMore && <div className="loader-spinner" style={{ width: 30, height: 30, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
          </div>
        )}

      </div>

      {/* 🎬 Cinema Slideshow Mode */}
      <CinemaSlideshowModal
        isOpen={cinemaOpen}
        onClose={() => setCinemaOpen(false)}
        photos={photos}
      />

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}
