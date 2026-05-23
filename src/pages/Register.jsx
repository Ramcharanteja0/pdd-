import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = ['Event Organizer', 'Venue Manager', 'Security Head', 'Operations Lead', 'Festival Director'];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPw: '', org: '', role: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!form.name.trim()) { setError('Full name is required.'); return; }
      if (!form.email.trim() || !form.email.includes('@')) { setError('Valid email is required.'); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (form.password !== form.confirmPw) { setError('Passwords do not match.'); return; }
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.org.trim()) { setError('Organisation name is required.'); return; }
    if (!form.role) { setError('Please select your role.'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div className="auth-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" fill="white" opacity="0.9"/>
                <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1" opacity="0.3"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'white' }}>CrowdIQ</span>
          </div>

          <h1>Operational intelligence for live venues</h1>
          <p>Join hundreds of event organizers who switched from reactive crowd management to AI-powered predictive intelligence.</p>

          {/* Plan preview */}
          <div className="auth-floating-card">
            <h3>✅ What you get for free</h3>
            {[
              'Live crowd dashboard (up to 3 zones)',
              'AI predictions & early warnings',
              'Staff dispatch & task management',
              'Incident logging & reports',
              'Basic analytics & compliance logs',
            ].map(item => (
              <div key={item} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)' }}>
                <CheckCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                {item}
              </div>
            ))}
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

          <div className="auth-title">Create your account</div>
          <div className="auth-subtitle">Start your free trial — no credit card needed</div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: s <= step ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s' }} />
            ))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 20 }}>Step {step} of 2 — {step === 1 ? 'Account Details' : 'Organisation Info'}</div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          {step === 1 ? (
            <div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-icon-wrap">
                  <User size={15} className="input-icon" />
                  <input id="reg-name" className="form-input" placeholder="Aarav Mehta" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrap">
                  <Mail size={15} className="input-icon" />
                  <input id="reg-email" type="email" className="form-input" placeholder="you@company.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrap" style={{ position: 'relative' }}>
                  <Lock size={15} className="input-icon" />
                  <input id="reg-password" type={showPw ? 'text' : 'password'} className="form-input" placeholder="Minimum 6 characters" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} style={{ paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-icon-wrap">
                  <Lock size={15} className="input-icon" />
                  <input id="reg-confirm" type="password" className="form-input" placeholder="Repeat password" value={form.confirmPw} onChange={e => setForm(f => ({...f, confirmPw: e.target.value}))} />
                </div>
              </div>
              <button id="reg-next" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.92rem' }} onClick={nextStep}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Organisation / Company Name</label>
                <div className="input-icon-wrap">
                  <Building2 size={15} className="input-icon" />
                  <input id="reg-org" className="form-input" placeholder="e.g. Sunburn Festival Pvt Ltd" value={form.org} onChange={e => setForm(f => ({...f, org: e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Your Role</label>
                <select id="reg-role" className="form-input form-select" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                  <option value="">Select your role</option>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20, padding: '12px 14px', background: 'var(--primary-light)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--primary-dark)' }}>
                🔒 Your data is encrypted and never shared. We comply with GDPR & India's DPDP Act.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button id="reg-submit" type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '12px', opacity: loading ? 0.75 : 1 }}>
                  {loading ? 'Creating account...' : '🚀 Create Account'}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <span className="auth-link" onClick={() => navigate('/login')}>Sign in here</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span className="auth-link" style={{ fontSize: '0.82rem' }} onClick={() => navigate('/')}>← Back to home</span>
          </div>
        </div>
      </div>
    </div>
  );
}
