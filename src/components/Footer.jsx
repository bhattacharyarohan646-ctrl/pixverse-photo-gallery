import { Link } from 'react-router-dom';
import { FiCamera, FiGithub, FiLinkedin, FiMail, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{ background: '#0B0F19', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 64, paddingBottom: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 40, marginBottom: 48 }}>
          
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiCamera size={18} color="#fff" />
              </div>
              <span className="font-poppins" style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>PixVerse</span>
            </Link>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24, maxWidth: 300 }}>
              A premium photography gallery showcasing the world's most stunning high-resolution images.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <SocialLink icon={<FiGithub />} href="https://github.com" />
              <SocialLink icon={<FiLinkedin />} href="https://linkedin.com" />
              <SocialLink icon={<FiMail />} href="mailto:hello@example.com" />
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 20 }}>Explore</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <FooterLink to="/gallery">Discover Photos</FooterLink>
              <FooterLink to="/gallery?cat=Nature">Nature Collection</FooterLink>
              <FooterLink to="/gallery?cat=Travel">Travel Destinations</FooterLink>
              <FooterLink to="/gallery?cat=Architecture">Architecture</FooterLink>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 20 }}>Project Info</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <FooterLink to="/collections">Collections & Boards</FooterLink>
              <li style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} /> Status: All systems operational
              </li>
              <li style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} /> Version: 1.0.0 (2026)
              </li>
            </ul>
          </div>

        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} PixVerse. All rights reserved.
          </p>
          <p style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            Made with <FiHeart size={14} color="#EF4444" style={{ fill: '#EF4444' }} /> for BCA Final Project
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        width: 36, height: 36, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
    >
      {icon}
    </a>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        style={{ color: '#94a3b8', fontSize: '0.9rem', transition: 'color 0.2s', display: 'inline-block' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#3B82F6')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
      >
        {children}
      </Link>
    </li>
  );
}
