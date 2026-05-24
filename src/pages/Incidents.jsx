import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import Topbar from '../components/Topbar';
import { fetchIncidents, createIncident, resolveIncident, fetchZones } from '../lib/supabaseService';

const TYPE_COLORS = {
  Medical:   { bg: '#FEE2E2', color: '#991B1B', icon: '🚑' },
  Security:  { bg: '#EDE9FE', color: '#5B21B6', icon: '🛡️' },
  Crowd:     { bg: '#FEF3C7', color: '#92400E', icon: '👥' },
  Technical: { bg: '#DBEAFE', color: '#1E40AF', icon: '⚙️' },
};

export default function Incidents({ sidebarOpen, setSidebarOpen }) {
  const [incidents, setIncidents] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ zone: '', type: 'Crowd', desc: '', reporter: '' });
  const [showForm, setShowForm]   = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    loadIncidents();
    loadZones();
  }, []);

  async function loadIncidents() {
    try {
      setLoading(true);
      const data = await fetchIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents:', err);
      setError('Could not load incidents. Check database connection.');
    } finally {
      setLoading(false);
    }
  }

  async function loadZones() {
    try {
      const data = await fetchZones();
      setZones(data);
    } catch (err) {
      console.error('Failed to load zones:', err);
    }
  }

  async function submitIncident() {
    if (!form.zone || !form.desc) return;
    try {
      setSaving(true);
      const newInc = await createIncident({
        title: `${form.type} incident at ${form.zone}`,
        zone: form.zone,
        type: form.type,
        description: form.desc,
        severity: 'medium',
      });
      setIncidents(prev => [newInc, ...prev]);
      setForm({ zone: '', type: 'Crowd', desc: '', reporter: '' });
      setShowForm(false);
    } catch (err) {
      setError('Failed to submit incident: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleResolve(id) {
    try {
      const updated = await resolveIncident(id);
      setIncidents(prev => prev.map(inc => inc.id === id ? updated : inc));
    } catch (err) {
      setError('Failed to resolve incident.');
    }
  }

  const open     = incidents.filter(i => i.status !== 'resolved').length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Incident Management" subtitle="Log, track and resolve operational incidents"
        onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      <div className="page-body">

        {error && (
          <div style={{ padding: '10px 16px', background: '#FEE2E2', color: '#991B1B', borderRadius: 8, marginBottom: 16, fontSize: '0.82rem', fontWeight: 600 }}>
            ⚠ {error} <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <span style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700, marginRight: 8 }}>
              {open} Open
            </span>
            <span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700 }}>
              {resolved} Resolved
            </span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            <AlertTriangle size={15} /> {showForm ? 'Cancel' : 'Report Incident'}
          </button>
        </div>

        {showForm && (
          <div className="card fade-in" style={{ marginBottom: 24, borderTop: '3px solid var(--danger)' }}>
            <div className="card-header"><span className="card-title">🚨 New Incident Report</span></div>
            <div className="card-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Zone / Location</label>
                  <select className="form-input form-select" value={form.zone} onChange={e => setForm(f => ({...f, zone: e.target.value}))}>
                    <option value="">— Select a zone —</option>
                    {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Incident Type</label>
                  <select className="form-input form-select" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                    {Object.keys(TYPE_COLORS).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={3} placeholder="Describe the incident..."
                    value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))} style={{ resize: 'vertical' }} />
                </div>
              </div>
              <button className="btn btn-danger" onClick={submitIncident} disabled={saving}>
                {saving ? '⟳ Saving...' : 'Submit Incident Report'}
              </button>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <span className="card-title">Incident Log</span>
            <button className="btn btn-sm btn-outline" onClick={loadIncidents}>↻ Refresh</button>
          </div>
          <div className="card-body" style={{ paddingTop: 10, overflowX: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading incidents from database...</div>
            ) : incidents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                <AlertTriangle size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 10px' }} />
                No incidents logged yet. Run the SQL schema in Supabase first.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Time</th><th>Type</th><th>Zone</th><th>Description</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {incidents.map(inc => {
                    const tc = TYPE_COLORS[inc.type] || TYPE_COLORS.Technical;
                    const time = new Date(inc.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <tr key={inc.id}>
                        <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{time}</td>
                        <td>
                          <span style={{ background: tc.bg, color: tc.color, padding: '3px 9px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>
                            {tc.icon} {inc.type}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{inc.zone}</td>
                        <td style={{ fontSize: '0.82rem', maxWidth: 260 }}>{inc.description}</td>
                        <td>
                          <span style={{
                            background: inc.status === 'resolved' ? '#D1FAE5' : '#FEF3C7',
                            color: inc.status === 'resolved' ? '#065F46' : '#92400E',
                            padding: '3px 9px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700
                          }}>
                            {inc.status === 'resolved' ? 'Resolved' : 'Open'}
                          </span>
                        </td>
                        <td>
                          {inc.status !== 'resolved' && (
                            <button className="btn btn-sm btn-outline" onClick={() => handleResolve(inc.id)}>
                              <CheckCircle size={12} /> Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
