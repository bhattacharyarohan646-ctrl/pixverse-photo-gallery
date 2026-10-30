import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMail, FiCode, FiLayout, FiSmartphone, FiCpu } from 'react-icons/fi';
import { pageTransition } from '../styles/animations';

export default function About() {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" style={{ paddingTop: 100, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 className="font-poppins" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            About The <span className="gradient-text">Project</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
            A premium, production-ready React Photo Gallery application built for BCA final year academic submission and portfolio.
          </p>
        </div>

        {/* Profile Card */}
        <div className="glass" style={{ borderRadius: 24, padding: 'clamp(24px, 5vw, 48px)', display: 'flex', flexDirection: 'column', gap: 40, marginBottom: 40, position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=BCAStudent&backgroundColor=b6e3f4"
              alt="Developer"
              style={{ width: 120, height: 120, borderRadius: '50%', border: '4px solid rgba(59,130,246,0.3)', boxShadow: '0 10px 30px rgba(59,130,246,0.2)' }}
            />
            <div>
              <h2 className="font-poppins" style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                BCA Student
              </h2>
              <p style={{ color: '#60A5FA', fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                Frontend Developer / UI Designer
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <SocialBtn icon={<FiGithub />} label="GitHub" />
                <SocialBtn icon={<FiLinkedin />} label="LinkedIn" />
                <SocialBtn icon={<FiMail />} label="Email" />
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Features */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiCode color="#3B82F6" /> Technical Architecture
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <FeatureCard icon={<FiLayout />} title="Modern React (Vite)" desc="Built with Vite for ultra-fast HMR and optimized production builds. Uses Functional Components and custom Hooks exclusively." />
              <FeatureCard icon={<FiSmartphone />} title="Tailwind CSS v4" desc="Fully responsive design using the latest Tailwind CSS v4 engine for utility-first, performant styling with custom design tokens." />
              <FeatureCard icon={<FiCpu />} title="Framer Motion" desc="Complex orchestration of page transitions, hover states, scroll reveals, and micro-interactions for a premium feel." />
              <FeatureCard icon={<FiCode />} title="State Management" desc="Context API combined with Custom Hooks for global state (Theme, Favorites, Toasts) backed by LocalStorage persistence." />
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

function SocialBtn({ icon, label }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
    >
      {icon} {label}
    </motion.button>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.1)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: '1.2rem' }}>
        {icon}
      </div>
      <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>{title}</h4>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
