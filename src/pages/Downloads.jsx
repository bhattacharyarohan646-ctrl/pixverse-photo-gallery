import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiDownload, FiTrash2, FiExternalLink, FiClock,
  FiHardDrive, FiCheckCircle, FiArrowRight
} from 'react-icons/fi';
import { useDownloads } from '../context/DownloadsContext';
import { useToast } from '../context/ToastContext';
import { downloadImage } from '../utils/helpers';
import { pageTransition } from '../styles/animations';

export default function Downloads() {
  const { downloads, removeDownload, clearDownloads } = useDownloads();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleReDownload = async (item) => {
    showToast({ message: `Re-downloading ${item.title}...`, type: 'info' });
    const ok = await downloadImage(item.rawUrl || item.imgUrl, item.title);
    if (ok) {
      showToast({ message: 'Download started!', type: 'success' });
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your download history?')) {
      clearDownloads();
      showToast({ message: 'Download history cleared', type: 'info' });
    }
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" style={{ paddingTop: 90, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <h1 className="font-poppins" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              My <span className="gradient-text">Downloads Hub</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
              Your downloaded high-definition wallpapers, originals, and edited studio masterpieces.
            </p>
          </div>

          {downloads.length > 0 && (
            <button
              onClick={handleClear}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 12,
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <FiTrash2 /> Clear History
            </button>
          )}
        </div>

        {/* Quick Stats Bar */}
        {downloads.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16, marginBottom: 32
          }}>
            <StatCard icon={<FiDownload color="#3B82F6" />} title="Total Downloads" value={downloads.length} />
            <StatCard icon={<FiHardDrive color="#8B5CF6" />} title="Latest Download" value={downloads[0]?.title.slice(0, 18) + '...' || 'None'} />
            <StatCard icon={<FiCheckCircle color="#10B981" />} title="Top Category" value={downloads[0]?.category || 'General'} />
          </div>
        )}

        {/* Downloads List */}
        {downloads.length === 0 ? (
          <div style={{
            padding: '60px 20px', background: 'rgba(255,255,255,0.02)',
            borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FiDownload size={28} />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>
              No downloads yet
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 24 }}>
              Explore the gallery to download high-resolution wallpapers and master photos.
            </p>
            <button
              onClick={() => navigate('/gallery')}
              style={{
                padding: '12px 28px', borderRadius: 14,
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8
              }}
            >
              Explore Gallery <FiArrowRight />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {downloads.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                style={{
                  background: 'rgba(20, 25, 35, 0.85)',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img
                    src={item.imgUrl}
                    alt={item.title}
                    style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }}
                  />
                  <div>
                    <Link
                      to={`/photo/${item.photoId}`}
                      style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {item.title} <FiExternalLink size={13} color="#64748b" />
                    </Link>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '3px 0 0' }}>
                      by {item.photographer} • <span style={{ color: '#60A5FA' }}>{item.format}</span> • {item.resolution}
                    </p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: '0.72rem', marginTop: 4 }}>
                      <FiClock size={11} /> {new Date(item.downloadedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => handleReDownload(item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10,
                      background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                      color: '#60A5FA', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    <FiDownload size={14} /> Re-download
                  </button>

                  <button
                    onClick={() => removeDownload(item.id)}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    title="Remove from history"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </motion.div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div style={{
      padding: '16px 20px', borderRadius: 16,
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', gap: 14
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem'
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
          {title}
        </p>
        <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: '2px 0 0' }}>
          {value}
        </h4>
      </div>
    </div>
  );
}
