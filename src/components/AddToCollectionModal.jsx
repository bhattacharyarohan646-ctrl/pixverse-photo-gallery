import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiCheck, FiFolder, FiFolderPlus } from 'react-icons/fi';
import { useCollections } from '../context/CollectionsContext';
import { useToast } from '../context/ToastContext';

export default function AddToCollectionModal({ isOpen, onClose, photo }) {
  const { collections, createCollection, addPhotoToCollection, removePhotoFromCollection, isPhotoInCollection } = useCollections();
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !photo) return null;

  const handleToggle = (colId) => {
    const inCol = isPhotoInCollection(colId, photo.id);
    if (inCol) {
      removePhotoFromCollection(colId, photo.id);
      showToast({ message: 'Removed from collection', type: 'info' });
    } else {
      addPhotoToCollection(colId, photo.id);
      showToast({ message: 'Added to collection! 🎉', type: 'success' });
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = createCollection(newTitle, newDesc);
    addPhotoToCollection(created.id, photo.id);
    showToast({ message: `Collection "${newTitle}" created & photo added!`, type: 'success' });
    setNewTitle('');
    setNewDesc('');
    setShowCreate(false);
  };

  return createPortal(
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            width: '100%', maxWidth: 440,
            background: '#0F172A',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            padding: 24,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Add to Collection
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '4px 0 0' }}>
                Save <span style={{ color: '#fff' }}>{photo.title}</span> into your moodboards
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: 'none',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Collection List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto', marginBottom: 16 }}>
            {collections.map(col => {
              const inCol = isPhotoInCollection(col.id, photo.id);
              return (
                <div
                  key={col.id}
                  onClick={() => handleToggle(col.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 14,
                    background: inCol ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${inCol ? '#3B82F6' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: inCol ? '#3B82F6' : 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: inCol ? '#fff' : '#94a3b8'
                    }}>
                      <FiFolder size={18} />
                    </div>
                    <div>
                      <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                        {col.name}
                      </p>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>
                        {col.photoIds.length} items
                      </p>
                    </div>
                  </div>

                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    border: `2px solid ${inCol ? '#3B82F6' : 'rgba(255,255,255,0.2)'}`,
                    background: inCol ? '#3B82F6' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', transition: 'all 0.2s'
                  }}>
                    {inCol && <FiCheck size={14} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create new collection form toggle */}
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                width: '100%', padding: '12px', borderRadius: 14,
                background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)',
                color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <FiFolderPlus size={18} /> Create New Collection
            </button>
          ) : (
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
              <input
                type="text"
                placeholder="Collection name (e.g. Minimalist Art)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                autoFocus
                required
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  background: '#0B0F19', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: '0.85rem'
                }}
              />
              <input
                type="text"
                placeholder="Optional description"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                style={{
                  width: '100%', padding: '8px 14px', borderRadius: 10,
                  background: '#0B0F19', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: '0.8rem'
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                    background: '#3B82F6', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Save & Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={{
                    padding: '8px 14px', borderRadius: 8, border: 'none',
                    background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={{ marginTop: 20, textAlign: 'right' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: '#3B82F6', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
