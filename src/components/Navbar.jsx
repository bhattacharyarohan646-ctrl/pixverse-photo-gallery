import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiHeart, FiSearch, FiCamera } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { navDrawer } from '../styles/animations';

const LINKS = [
  { path: '/', label: 'Home' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/collections', label: 'Collections' },
  { path: '/downloads', label: 'Downloads' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { favoriteIds } = useFavorites();
  const { user, openLoginModal, logOut, isLoggingOut } = useAuth();
  const { showToast } = useToast();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
      showToast({ message: 'Failed to sign out. Please try again.', type: 'error' });
    }
  };

  const handleMobileLogOut = async () => {
    try {
      await logOut();
      setMobileOpen(false);
    } catch (error) {
      console.error('Mobile logout error:', error);
      showToast({ message: 'Failed to sign out. Please try again.', type: 'error' });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const timer = setTimeout(() => setMobileOpen(false), 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <motion.nav
        className={scrolled ? 'navbar-glass' : ''}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: 72,
          zIndex: 1000,
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          transition: 'background 0.3s, border-bottom 0.3s, backdrop-filter 0.3s',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#fff',
            }}
          >
            <div
              style={{
                width: 38, height: 38, borderRadius: 12,
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
              }}
            >
              <FiCamera size={20} color="#fff" />
            </div>
            <span className="font-poppins" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              PixVerse
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
            <div style={{ display: 'flex', gap: 24 }}>
              {LINKS.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: active ? '#fff' : '#94a3b8',
                      transition: 'color 0.2s',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#e2e8f0'; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    {link.label}
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        style={{
                          position: 'absolute',
                          bottom: -6, left: 0, right: 0,
                          height: 2,
                          background: '#3B82F6',
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => navigate('/gallery')}
                style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                title="Search"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <FiSearch size={20} />
              </button>
              
              <Link
                to="/favorites"
                style={{ color: location.pathname === '/favorites' ? '#F87171' : '#94a3b8', position: 'relative', display: 'flex' }}
                title="Favorites"
                onMouseEnter={(e) => { if(location.pathname !== '/favorites') e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { if(location.pathname !== '/favorites') e.currentTarget.style.color = '#94a3b8'; }}
              >
                <FiHeart size={20} />
                {favoriteIds.length > 0 && (
                  <span
                    style={{
                      position: 'absolute', top: -6, right: -8,
                      background: '#EF4444', color: '#fff',
                      fontSize: '0.65rem', fontWeight: 700,
                      width: 16, height: 16, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {favoriteIds.length > 99 ? '99+' : favoriteIds.length}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%' }}
                  >
                    <img
                       src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4"}
                       alt={user.displayName || "User avatar"}
                       style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', objectFit: 'cover' }}
                    />
                  </button>
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{
                          position: 'absolute', top: '100%', right: 0, marginTop: 8,
                          background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 12, padding: 8, width: 200, zIndex: 50,
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
                          <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</p>
                          <p style={{ color: '#64748b', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                        </div>
                        <Link 
                          to="/downloads" 
                          onClick={() => setShowDropdown(false)}
                          style={{ display: 'block', padding: '8px 12px', color: '#cbd5e1', fontSize: '0.9rem', borderRadius: 8, textDecoration: 'none' }} 
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} 
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          My Downloads
                        </Link>
                        <button 
                          onClick={handleLogOut} 
                          disabled={isLoggingOut}
                          style={{ 
                            width: '100%', 
                            textAlign: 'left', 
                            padding: '8px 12px', 
                            color: isLoggingOut ? '#64748b' : '#ef4444', 
                            fontSize: '0.9rem', 
                            borderRadius: 8, 
                            background: 'none', 
                            border: 'none', 
                            cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: isLoggingOut ? 0.7 : 1,
                          }} 
                          onMouseEnter={e => { if (!isLoggingOut) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} 
                          onMouseLeave={e => { if (!isLoggingOut) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {isLoggingOut ? (
                            <>
                              <motion.div
                                style={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  border: '2px solid rgba(239, 68, 68, 0.2)',
                                  borderTopColor: '#ef4444',
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
                              />
                              Signing out...
                            </>
                          ) : (
                            'Sign Out'
                          )}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  style={{
                    background: 'rgba(255,255,255,0.1)', color: '#fff',
                    padding: '8px 16px', borderRadius: 20, fontSize: '0.9rem', fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(true)}
              style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                zIndex: 1001,
              }}
            />
            <motion.div
              variants={navDrawer}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 280, background: '#111827',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                zIndex: 1002, padding: 24,
                display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <span className="font-poppins" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <FiX size={24} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[...LINKS, { path: '/favorites', label: `Favorites (${favoriteIds.length})` }].map((link) => {
                  const active = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      style={{
                        fontSize: '1.1rem', fontWeight: 600,
                        color: active ? '#3B82F6' : '#fff',
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              {user && (
                <Link
                  to="/downloads"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontSize: '1.1rem', fontWeight: 600,
                    color: location.pathname === '/downloads' ? '#3B82F6' : '#fff',
                  }}
                >
                  Downloads
                </Link>
              )}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {user ? (
                  <>
                    <img
                       src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4"}
                       alt="User avatar"
                       style={{ width: 40, height: 40, borderRadius: '50%' }}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</p>
                      {isLoggingOut ? (
                        <p style={{ color: '#94a3b8', fontSize: '0.75rem', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <motion.span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              border: '1.5px solid rgba(148, 163, 184, 0.2)',
                              borderTopColor: '#94a3b8',
                              display: 'inline-block'
                            }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
                          />
                          Signing out...
                        </p>
                      ) : (
                        <p style={{ color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }} onClick={handleMobileLogOut}>Sign Out</p>
                      )}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => { openLoginModal(); setMobileOpen(false); }}
                    style={{ width: '100%', background: '#3B82F6', color: '#fff', padding: '12px', borderRadius: 12, fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer' }}
                  >
                    Sign In with Google
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add hidden utility classes to index.css if not present, but using style display none/block via media queries is better. Since we don't have CSS modules, I'll inline responsive styles where needed or rely on Tailwind classes. */}
      <style>{`
        @media (max-width: 768px) {
          .md\\:hidden { display: flex !important; }
          .hidden.md\\:flex { display: none !important; }
        }
        @media (min-width: 769px) {
          .md\\:hidden { display: none !important; }
          .hidden.md\\:flex { display: flex !important; }
        }
      `}</style>
    </>
  );
}
