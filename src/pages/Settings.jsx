import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Map, Users, Palette, Save } from 'lucide-react';
import Topbar from '../components/Topbar';
import { EVENT_INFO } from '../data/mockData';

export default function Settings({ sidebarOpen, setSidebarOpen }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    eventName: EVENT_INFO.name,
    venue: EVENT_INFO.venue,
    city: EVENT_INFO.city,
    capacity: EVENT_INFO.totalCapacity,
    alertThreshold: 80,
    criticalThreshold: 90,
    autoAlert: true,
    staffNotif: true,
    smsAlert: false,
    emailReport: true,
  });

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggle = (key) => setForm(f => ({ ...f, [key]: !f[key] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Platform Settings" subtitle="Configure your event and alert preferences" onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      <div className="page-body">
        <div style={{ maxWidth: 700 }}>

          {/* Event Info */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title"><Map size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Event Configuration</span>
            </div>
            <div className="card-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Event Name</label>
                  <input className="form-input" value={form.eventName} onChange={e => setForm(f => ({...f, eventName: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input className="form-input" value={form.venue} onChange={e => setForm(f => ({...f, venue: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Location / City</label>
                  <select className="form-input form-select" value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))}>
                    <option value="">— Select city —</option>
                    {[
                      'Mumbai, India', 'Delhi, India', 'Bengaluru, India',
                      'Hyderabad, India', 'Chennai, India', 'Pune, India',
                      'Kolkata, India', 'Ahmedabad, India', 'Jaipur, India',
                      'Goa, India', 'Chandigarh, India', 'Kochi, India',
                    ].map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Capacity</label>
                  <input className="form-input" type="number" value={form.capacity} onChange={e => setForm(f => ({...f, capacity: +e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input className="form-input" defaultValue="2026-05-13" type="date" />
                </div>
              </div>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title"><Bell size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Alert Thresholds</span>
            </div>
            <div className="card-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Warning Threshold (%)</label>
                  <input className="form-input" type="number" min={50} max={100} value={form.alertThreshold}
                    onChange={e => setForm(f => ({...f, alertThreshold: +e.target.value}))} />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Alert triggers above this density level</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Critical Threshold (%)</label>
                  <input className="form-input" type="number" min={70} max={100} value={form.criticalThreshold}
                    onChange={e => setForm(f => ({...f, criticalThreshold: +e.target.value}))} />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Emergency protocol triggers above this</div>
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flex: 1, height: 12, background: 'linear-gradient(90deg, #10B981, #F59E0B, #EF4444)', borderRadius: 99, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: -18, left: `${form.alertThreshold}%`, fontSize: '0.65rem', fontWeight: 700, color: '#92400E', transform: 'translateX(-50%)' }}>⚠️{form.alertThreshold}%</div>
                    <div style={{ position: 'absolute', top: -18, left: `${form.criticalThreshold}%`, fontSize: '0.65rem', fontWeight: 700, color: '#991B1B', transform: 'translateX(-50%)' }}>🔴{form.criticalThreshold}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title"><Bell size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Notification Settings</span>
            </div>
            <div className="card-body">
              {[
                { key: 'autoAlert', label: 'Auto-generate alerts', desc: 'System automatically creates alerts when thresholds exceeded' },
                { key: 'staffNotif', label: 'Push to Staff App', desc: 'Send alerts directly to staff mobile devices' },
                { key: 'smsAlert', label: 'SMS Notifications', desc: 'Send SMS to supervisors for critical events' },
                { key: 'emailReport', label: 'Email Summary Reports', desc: 'Receive hourly event summary via email' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                  </div>
                  <div onClick={() => toggle(key)} style={{ width: 44, height: 24, borderRadius: 99, background: form[key] ? 'var(--primary)' : '#CBD5E1', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 3, left: form[key] ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }} onClick={saveSettings}>
            <Save size={16} /> {saved ? '✅ Settings Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
