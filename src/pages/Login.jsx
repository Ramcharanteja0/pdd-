import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message?.toLowerCase() || '';
      if (msg.includes('email not confirmed')) {
        setError('Email not confirmed. Go to your Supabase Dashboard → Authentication → Users → find this email → click the 3 dots → Confirm User. Or delete the user and register again.');
      } else if (msg.includes('invalid login')) {
        setError('Invalid email or password. Please check and try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Attempt to create the demo account (ignored if it already exists)
      const { supabase } = await import('../lib/supabase');
      await supabase.auth.signUp({
        email: 'demo@crowdiq.ai',
        password: 'demo1234',
        options: { data: { name: 'Demo Organizer', org: 'CrowdIQ Demo', role: 'Event Organizer' } }
      });
      
      // Now log in with the demo account
      await login({ email: 'demo@crowdiq.ai', password: 'demo1234' });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message?.toLowerCase() || '';
      if (msg.includes('email not confirmed')) {
        setError('Demo account needs email confirmation disabled in Supabase. Go to Authentication → Providers → Email → disable "Confirm email" → Save.');
      } else {
        setError('Demo login failed: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div className="auth-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" fill="white" opacity="0.9"/>
                  <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1" opacity="0.3"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'white' }}>CrowdIQ</span>
            </div>
          </div>
          <h1>Welcome back to your control centre</h1>
          <p>Monitor your live event, track crowd density, predict incidents and dispatch staff — all from one dashboard.</p>
          {[
            { icon: '🗺️', text: 'Real-time crowd heatmap across all zones' },
            { icon: '⚡', text: 'AI predictions with 90%+ accuracy' },
            { icon: '👥', text: 'Live staff dispatch and tracking' },
            { icon: '🔔', text: 'Automated emergency alerts' },
          ].map(f => (
            <div key={f.text} className="auth-feature">
              <div className="auth-feature-icon">{f.icon}</div>
              <div className="auth-feature-text">{f.text}</div>
            </div>
          ))}

          <div className="auth-floating-card">
            <h3>📊 Platform Stats (Live)</h3>
            <div className="auth-stat-row">
              {[['500+', 'Events'], ['2M+', 'Attendees'], ['91%', 'AI Accuracy']].map(([v, l]) => (
                <div key={l} className="auth-stat">
                  <div className="auth-stat-val">{v}</div>
                  <div className="auth-stat-lbl">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-right-inner fade-in">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" fill="white" opacity="0.9"/>
                <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.5" opacity="0.6"/>
              </svg>
            </div>
            <span className="auth-logo-text">Crowd<span>IQ</span></span>
          </div>

          <div className="auth-title">Sign in</div>
          <div className="auth-subtitle">Access your event operations dashboard</div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrap">
                <Mail size={15} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <span className="auth-link" style={{ fontSize: '0.78rem' }}>Forgot password?</span>
              </div>
              <div className="input-icon-wrap" style={{ position: 'relative' }}>
                <Lock size={15} className="input-icon" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  style={{ paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.92rem', marginTop: 4, opacity: loading ? 0.75 : 1 }}
            >
              {loading ? 'Signing in...' : <><ArrowRight size={16} /> Sign In</>}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button
            className="btn"
            style={{ width: '100%', justifyContent: 'center', background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text-primary)', padding: '11px' }}
            onClick={demoLogin}
            disabled={loading}
          >
            🚀 Try Demo Dashboard
          </button>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <span className="auth-link" onClick={() => navigate('/register')}>Create one free</span>
          </div>

          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <span className="auth-link" style={{ fontSize: '0.82rem' }} onClick={() => navigate('/')}>
              ← Back to home
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
