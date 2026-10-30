import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import ImageDetails from './pages/ImageDetails';
import Favorites from './pages/Favorites';
import Collections from './pages/Collections';
import Downloads from './pages/Downloads';
import NotFound from './pages/NotFound';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Contexts
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CollectionsProvider } from './context/CollectionsContext';
import { DownloadsProvider } from './context/DownloadsContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CollectionsProvider>
              <DownloadsProvider>
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                  <Navbar />
                  
                  <main style={{ flex: 1 }}>
                    <AnimatePresence mode="wait" initial={false}>
                      <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<Home />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/collections" element={<Collections />} />
                        <Route path="/photo/:id" element={<ImageDetails />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/downloads" element={<Downloads />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AnimatePresence>
                  </main>

                  <Footer />
                  <ScrollToTop />
                </div>
              </DownloadsProvider>
            </CollectionsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
