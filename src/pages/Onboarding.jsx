import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart3, Users, Map, Bell } from 'lucide-react';

const FEATURES = [
  { icon: '🗺️', bg: '#EEF2FF', title: 'Live Venue Heatmap', desc: 'Real-time crowd density across every zone — green, yellow, red at a glance.' },
  { icon: '⚡', bg: '#FEF3C7', title: 'AI Predictions', desc: 'Predict crowd spikes up to 20 minutes before they happen with 90%+ accuracy.' },
  { icon: '👥', bg: '#D1FAE5', title: 'Staff Dispatch', desc: 'One-tap task assignment to security, medical, and volunteer staff in real time.' },
  { icon: '🔔', bg: '#FEE2E2', title: 'Instant Alerts', desc: 'Auto-generated emergency alerts for gate overload, exit blockage, and surges.' },
  { icon: '🛍️', bg: '#F5F3FF', title: 'Vendor Intelligence', desc: 'Track footfall, revenue and queue times per stall. Maximize sponsor ROI.' },
  { icon: '📊', bg: '#DBEAFE', title: 'Safety Reports', desc: 'Post-event compliance logs for government, insurance and legal protection.' },
];

const STATS = [
  { val: '500+', label: 'Events Managed' },
  { val: '2M+', label: 'Attendees Monitored' },
  { val: '91%', label: 'AI Accuracy' },
  { val: '3.2 min', label: 'Avg Response Time' },
];

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="onboarding-shell">
      {/* Navbar */}
      <nav className="ob-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="auth-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="white" opacity="0.9"/>
              <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.5" opacity="0.6"/>
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1" opacity="0.3"/>
            </svg>
          </div>
          <span className="auth-logo-text">Crowd<span>IQ</span></span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="ob-hero">
        <div className="ob-hero-content fade-in">
          <div className="ob-hero-badge">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', animation: 'pulse-dot 1.5s infinite', display: 'inline-block' }} />
            AI-Powered · Real-Time · Production-Ready
          </div>
          <h1>The Intelligence Platform for Live Events</h1>
          <p>
            Stop reacting. Start predicting. CrowdIQ gives organizers real-time crowd intelligence,
            AI-powered alerts, and operational control — before disasters happen.
          </p>
          <div className="ob-hero-btns">
            <button
              className="btn"
              style={{ background: 'white', color: '#6366F1', padding: '14px 32px', fontSize: '0.95rem', fontWeight: 700, borderRadius: 10 }}
              onClick={() => navigate('/register')}
            >
              Start Free Trial <ArrowRight size={16} />
            </button>
            <button
              className="btn"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', padding: '14px 32px', fontSize: '0.95rem', fontWeight: 700, borderRadius: 10 }}
              onClick={() => navigate('/login')}
            >
              Sign In to Dashboard
            </button>
          </div>
          {/* Floating Stats */}
          <div className="auth-floating-card" style={{ maxWidth: 480, margin: '44px auto 0' }}>
            <h3>🚀 Trusted by event organizers worldwide</h3>
            <div className="auth-stat-row" style={{ justifyContent: 'space-around' }}>
              {STATS.map(s => (
                <div key={s.label} className="auth-stat">
                  <div className="auth-stat-val">{s.val}</div>
                  <div className="auth-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="ob-section" style={{ background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="ob-section-label">Platform Capabilities</div>
            <div className="ob-section-title">Everything you need to run a safe event</div>
            <div className="ob-section-sub" style={{ margin: '0 auto' }}>
              From live monitoring to post-event reports — CrowdIQ is the only platform built
              specifically for operational crowd intelligence.
            </div>
          </div>
          <div className="ob-features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="ob-feature-card">
                <div className="ob-feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                <div className="ob-feature-title">{f.title}</div>
                <div className="ob-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reactive → Predictive Section */}
      <section className="ob-section">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div className="ob-section-label">The Core Shift</div>
            <div className="ob-section-title">From Reactive to Predictive Management</div>
            <div className="ob-section-sub">
              Most events operate blindly — organizers only realize problems after gates get overcrowded,
              queues become massive, and security teams panic.
            </div>
            {[
              { before: 'Gate gets overcrowded', after: 'Alert 18 min before threshold' },
              { before: 'Staff scramble on-site', after: 'Automated task dispatch' },
              { before: 'Post-event incident report', after: 'Real-time compliance log' },
            ].map(({ before, after }) => (
              <div key={before} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ flex: 1, background: '#FEE2E2', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: '#991B1B', fontWeight: 500 }}>✗ {before}</div>
                <ArrowRight size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, background: '#D1FAE5', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: '#065F46', fontWeight: 500 }}>✓ {after}</div>
              </div>
            ))}
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/register')}>
              Get Started <ArrowRight size={15} />
            </button>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', borderRadius: 24, padding: 40, border: '1px solid #C7D2FE' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 20 }}>⚡ AI Prediction Example</div>
            {[
              { zone: 'Main Stage Exit', risk: 'HIGH', msg: 'Exit rush in ~18 min', conf: 92, color: '#EF4444' },
              { zone: 'Food Court A', risk: 'HIGH', msg: 'Queue will exceed 200 in ~10 min', conf: 87, color: '#F59E0B' },
              { zone: 'North Entrance', risk: 'MEDIUM', msg: 'Entry surge at 15:00', conf: 78, color: '#6366F1' },
            ].map(p => (
              <div key={p.zone} style={{ background: 'white', borderRadius: 12, padding: '14px 16px', marginBottom: 12, border: `1px solid ${p.color}30`, borderLeft: `3px solid ${p.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.zone}</span>
                  <span style={{ background: p.color + '22', color: p.color, fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 99 }}>{p.risk}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{p.msg}</div>
                <div style={{ height: 4, background: '#E0E7FF', borderRadius: 99 }}>
                  <div style={{ width: `${p.conf}%`, height: '100%', background: p.color, borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>{p.conf}% confidence</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <div className="ob-stats-strip">
        {STATS.map(s => (
          <div key={s.label}>
            <div className="ob-stat-big">{s.val}</div>
            <div className="ob-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="ob-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="auth-logo-icon" style={{ width: 28, height: 28 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="white"/>
              <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.5" opacity="0.6"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
            Crowd<span style={{ color: 'var(--primary)' }}>IQ</span>
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: 8 }}>© 2026 CrowdIQ Technologies</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy Policy', 'Terms of Service', 'Support'].map(l => (
            <span key={l} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
