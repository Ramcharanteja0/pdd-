import { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import Topbar from '../components/Topbar';
import { INCIDENT_LOG, ZONES } from '../data/mockData';

const TYPE_COLORS = {
  Medical: { bg: '#FEE2E2', color: '#991B1B', icon: '🚑' },
  Security: { bg: '#EDE9FE', color: '#5B21B6', icon: '🛡️' },
  Crowd: { bg: '#FEF3C7', color: '#92400E', icon: '👥' },
  Technical: { bg: '#DBEAFE', color: '#1E40AF', icon: '⚙️' },
};

export default function Incidents({ sidebarOpen, setSidebarOpen }) {
  const [incidents, setIncidents] = useState(INCIDENT_LOG);
  const [form, setForm] = useState({ zone: '', type: 'Crowd', desc: '', reporter: '' });
  const [showForm, setShowForm] = useState(false);

  const submitIncident = () => {
    if (!form.zone || !form.desc) return;
    const newInc = {
      id: `I${incidents.length + 1}`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      zone: form.zone, type: form.type, desc: form.desc,
      reporter: form.reporter || 'Dashboard', status: 'Open'
    };
    setIncidents(prev => [newInc, ...prev]);
    setForm({ zone: '', type: 'Crowd', desc: '', reporter: '' });
    setShowForm(false);
  };

  const resolve = (id) => setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'Resolved' } : inc));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Incident Management" subtitle="Log, track and resolve operational incidents" onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      <div className="page-body">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <span style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700, marginRight: 8 }}>
              {incidents.filter(i => i.status !== 'Resolved').length} Open
            </span>
            <span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700 }}>
              {incidents.filter(i => i.status === 'Resolved').length} Resolved
            </span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            <AlertTriangle size={15} /> {showForm ? 'Cancel' : 'Report Incident'}
          </button>
        </div>

        {/* Report Form */}
        {showForm && (
          <div className="card fade-in" style={{ marginBottom: 24, borderTop: '3px solid var(--danger)' }}>
            <div className="card-header"><span className="card-title">🚨 New Incident Report</span></div>
            <div className="card-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Zone / Location</label>
                  <select className="form-input form-select" value={form.zone} onChange={e => setForm(f => ({...f, zone: e.target.value}))}>
                    <option value="">— Select a zone —</option>
                    {ZONES.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
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
                  <textarea className="form-input" rows={3} placeholder="Describe the incident..." value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reporter Name / ID</label>
                  <input className="form-input" placeholder="e.g. S04 or Kavita Singh" value={form.reporter} onChange={e => setForm(f => ({...f, reporter: e.target.value}))} />
                </div>
              </div>
              <button className="btn btn-danger" onClick={submitIncident}>Submit Incident Report</button>
            </div>
          </div>
        )}

        {/* Incidents List */}
        <div className="card">
          <div className="card-header"><span className="card-title">Incident Log</span></div>
          <div className="card-body" style={{ paddingTop: 10, overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th><th>Type</th><th>Zone</th><th>Description</th><th>Reporter</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(inc => {
                  const tc = TYPE_COLORS[inc.type] || TYPE_COLORS.Technical;
                  return (
                    <tr key={inc.id}>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{inc.time}</td>
                      <td>
                        <span style={{ background: tc.bg, color: tc.color, padding: '3px 9px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>
                          {tc.icon} {inc.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{inc.zone}</td>
                      <td style={{ fontSize: '0.82rem', maxWidth: 260 }}>{inc.desc}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{inc.reporter}</td>
                      <td>
                        <span style={{ background: inc.status === 'Resolved' ? '#D1FAE5' : '#FEF3C7', color: inc.status === 'Resolved' ? '#065F46' : '#92400E', padding: '3px 9px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>
                          {inc.status}
                        </span>
                      </td>
                      <td>
                        {inc.status !== 'Resolved' && (
                          <button className="btn btn-sm btn-outline" onClick={() => resolve(inc.id)}>
                            <CheckCircle size={12} /> Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
