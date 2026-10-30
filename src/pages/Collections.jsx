import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiFolder, FiPlus, FiTrash2, FiArrowLeft, FiImage,
  FiGrid, FiFolderPlus, FiShare2, FiCheck, FiX, FiSearch
} from 'react-icons/fi';
import { useCollections } from '../context/CollectionsContext';
import { useToast } from '../context/ToastContext';
import { photos as ALL_LOCAL_PHOTOS } from '../data/photos';
import GalleryGrid from '../components/GalleryGrid';
import { pageTransition } from '../styles/animations';

export default function Collections() {
  const {
    collections,
    createCollection,
    deleteCollection,
    addPhotoToCollection,
    removePhotoFromCollection,
    isPhotoInCollection
  } = useCollections();
  const [selectedColId, setSelectedColId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddPhotosModal, setShowAddPhotosModal] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createCollection(name, desc);
    showToast({ message: `Moodboard "${name}" created!`, type: 'success' });
    setName('');
    setDesc('');
    setShowCreateModal(false);
  };

  const handleDelete = (e, colId, colName) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${colName}"?`)) {
      deleteCollection(colId);
      if (selectedColId === colId) setSelectedColId(null);
      showToast({ message: `Collection deleted`, type: 'info' });
    }
  };

  const selectedCollection = collections.find(c => c.id === selectedColId);

  // Find photos belonging to selected collection
  const collectionPhotos = selectedCollection
    ? ALL_LOCAL_PHOTOS.filter(p => selectedCollection.photoIds.includes(String(p.id)))
    : [];

  const filteredPickerPhotos = ALL_LOCAL_PHOTOS.filter(p =>
    p.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    p.photographer.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" style={{ paddingTop: 90, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        
        {/* ── Active Collection Detail View ─────────────────── */}
        {selectedCollection ? (
          <div>
            <button
              onClick={() => setSelectedColId(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: '#94a3b8', background: 'none', border: 'none',
                cursor: 'pointer', marginBottom: 24, fontSize: '0.95rem', fontWeight: 500
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              <FiArrowLeft /> Back to All Collections
            </button>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              marginBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 24
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h1 className="font-poppins" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {selectedCollection.name}
                  </h1>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 700, padding: '4px 12px',
                    borderRadius: 999, background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)'
                  }}>
                    {selectedCollection.photoIds.length} Photos
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>
                  {selectedCollection.description || 'Curated personal moodboard'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowAddPhotosModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 12,
                    background: '#3B82F6', color: '#fff', border: 'none',
                    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
                  }}
                >
                  <FiPlus /> Add Photos
                </button>
              </div>
            </div>

            {collectionPhotos.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                background: 'rgba(255,255,255,0.02)', borderRadius: 24,
                border: '1px dashed rgba(255,255,255,0.1)'
              }}>
                <FiImage size={40} color="#64748b" style={{ marginBottom: 16 }} />
                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
                  No photos in this collection yet
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 24 }}>
                  Add photos directly using the selector or browse the gallery cards.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <button
                    onClick={() => setShowAddPhotosModal(true)}
                    style={{
                      padding: '12px 24px', borderRadius: 12, background: '#3B82F6',
                      color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    + Pick Photos Now
                  </button>
                  <button
                    onClick={() => navigate('/gallery')}
                    style={{
                      padding: '12px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.08)',
                      color: '#cbd5e1', border: 'none', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Explore Gallery
                  </button>
                </div>
              </div>
            ) : (
              <GalleryGrid photos={collectionPhotos} />
            )}
          </div>
        ) : (
          /* ── All Collections Grid View ─────────────────────── */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
              <div>
                <h1 className="font-poppins" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                  Custom <span className="gradient-text">Moodboards & Collections</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                  Organize your inspirations into thematic boards and creative albums.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 22px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.95rem',
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(59,130,246,0.3)'
                }}
              >
                <FiFolderPlus size={18} /> New Collection
              </button>
            </div>

            {/* Collections Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {collections.map((col, idx) => {
                // Fetch up to 4 cover photos
                const coverPhotos = ALL_LOCAL_PHOTOS.filter(p => col.photoIds.includes(String(p.id))).slice(0, 4);

                return (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    whileHover={{ y: -6 }}
                    onClick={() => setSelectedColId(col.id)}
                    style={{
                      background: 'rgba(20, 25, 35, 0.85)',
                      borderRadius: 20,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Mosaic Preview (up to 4 images) */}
                    <div style={{
                      height: 200, background: '#0B0F19',
                      display: 'grid',
                      gridTemplateColumns: coverPhotos.length > 1 ? '1fr 1fr' : '1fr',
                      gap: 2, overflow: 'hidden', position: 'relative'
                    }}>
                      {coverPhotos.length > 0 ? (
                        coverPhotos.map((cp, i) => (
                          <img
                            key={i}
                            src={cp.thumbUrl || cp.imgUrl}
                            alt={cp.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ))
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569' }}>
                          <FiFolder size={48} />
                        </div>
                      )}
                      
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                        padding: '4px 10px', borderRadius: 999, color: '#fff', fontSize: '0.75rem', fontWeight: 700
                      }}>
                        {col.photoIds.length} items
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px' }}>
                          {col.name}
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                          {col.description || 'Curated board'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                          Created {new Date(col.createdAt).toLocaleDateString()}
                        </span>

                        <button
                          onClick={(e) => handleDelete(e, col.id, col.name)}
                          style={{
                            background: 'none', border: 'none', color: '#64748b',
                            cursor: 'pointer', padding: 6, borderRadius: 6
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                          title="Delete Moodboard"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#0F172A', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)',
            padding: 28, maxWidth: 440, width: '100%'
          }}>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px' }}>
              Create New Moodboard
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 20 }}>
              Group your visual inspirations into a themed collection.
            </p>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="text"
                placeholder="Collection Name (e.g. Cyberpunk Aesthetics)"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                required
                style={{
                  padding: '12px 16px', borderRadius: 12, background: '#090D16',
                  border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem'
                }}
              />

              <textarea
                placeholder="Description / notes (optional)"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={3}
                style={{
                  padding: '12px 16px', borderRadius: 12, background: '#090D16',
                  border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem',
                  resize: 'none'
                }}
              />

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                    background: '#3B82F6', color: '#fff', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Create Board
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '12px 20px', borderRadius: 12, border: 'none',
                    background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Photos to Collection Picker Modal */}
      {showAddPhotosModal && selectedCollection && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1300,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#0F172A', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)',
            padding: 24, maxWidth: 680, width: '100%', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  Add Photos to "{selectedCollection.name}"
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0' }}>
                  Click photos to toggle them in or out of this collection
                </p>
              </div>
              <button
                onClick={() => setShowAddPhotosModal(false)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                  border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Search filter in picker */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 12, background: '#070B12',
              border: '1px solid rgba(255,255,255,0.1)', marginBottom: 16
            }}>
              <FiSearch color="#64748b" />
              <input
                type="text"
                placeholder="Search photos by title, category, or artist..."
                value={pickerSearch}
                onChange={e => setPickerSearch(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', color: '#fff',
                  fontSize: '0.85rem', width: '100%', outline: 'none'
                }}
              />
              {pickerSearch && (
                <button
                  onClick={() => setPickerSearch('')}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Photo Grid */}
            <div style={{
              flex: 1, overflowY: 'auto', display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 12, paddingRight: 4
            }}>
              {filteredPickerPhotos.map(photo => {
                const inCol = isPhotoInCollection(selectedCollection.id, photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      if (inCol) {
                        removePhotoFromCollection(selectedCollection.id, photo.id);
                        showToast({ message: `Removed "${photo.title}"`, type: 'info' });
                      } else {
                        addPhotoToCollection(selectedCollection.id, photo.id);
                        showToast({ message: `Added "${photo.title}"! 🎉`, type: 'success' });
                      }
                    }}
                    style={{
                      position: 'relative', borderRadius: 12, overflow: 'hidden',
                      height: 120, cursor: 'pointer',
                      border: `2px solid ${inCol ? '#3B82F6' : 'rgba(255,255,255,0.1)'}`,
                      boxShadow: inCol ? '0 0 12px rgba(59,130,246,0.5)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <img
                      src={photo.thumbUrl || photo.imgUrl}
                      alt={photo.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: inCol ? 'rgba(59,130,246,0.3)' : 'rgba(0,0,0,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: inCol ? '#3B82F6' : 'rgba(0,0,0,0.6)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${inCol ? '#fff' : 'rgba(255,255,255,0.4)'}`
                      }}>
                        {inCol ? <FiCheck size={16} /> : <FiPlus size={16} />}
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '4px 6px', background: 'rgba(0,0,0,0.7)',
                      fontSize: '0.68rem', color: '#fff', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {photo.title}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                {selectedCollection.photoIds.length} photos in this collection
              </span>
              <button
                onClick={() => setShowAddPhotosModal(false)}
                style={{
                  padding: '10px 22px', borderRadius: 12, background: '#3B82F6',
                  color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
