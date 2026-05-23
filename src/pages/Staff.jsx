import { useState } from 'react';
import { Phone, MapPin, UserCheck, UserX, Send } from 'lucide-react';
import Topbar from '../components/Topbar';
import { STAFF } from '../data/mockData';

const ROLE_COLORS = {
  Security: '#6366F1', Medical: '#EF4444', Volunteer: '#10B981',
  Cleaner: '#F59E0B', Supervisor: '#8B5CF6'
};

const STATUS_CONFIG = {
  active: { label: 'Active', bg: '#D1FAE5', color: '#065F46' },
  busy: { label: 'Busy', bg: '#FEF3C7', color: '#92400E' },
  offline: { label: 'Offline', bg: '#F1F5F9', color: '#64748B' },
};

export default function Staff({ sidebarOpen, setSidebarOpen }) {
  const [selected, setSelected] = useState(null);
  const [taskMsg, setTaskMsg] = useState('');
  const [filter, setFilter] = useState('all');
  const [dispatched, setDispatched] = useState([]);

  const filtered = filter === 'all' ? STAFF : STAFF.filter(s => s.role === filter || s.status === filter);

  const dispatch = () => {
    if (!taskMsg.trim() || !selected) return;
    setDispatched(prev => [...prev, { staffId: selected.id, msg: taskMsg, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
    setTaskMsg('');
  };

  const roles = ['all', ...new Set(STAFF.map(s => s.role))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Staff Management" subtitle="84 staff deployed across 12 zones" onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      <div className="page-body">

        {/* Summary */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
          {[
            { label: 'Active', value: STAFF.filter(s=>s.status==='active').length, color: 'green' },
            { label: 'Busy', value: STAFF.filter(s=>s.status==='busy').length, color: 'amber' },
            { label: 'Offline', value: STAFF.filter(s=>s.status==='offline').length, color: 'red' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`stat-card ${color}`}>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid-main-aside" style={{ alignItems: 'start' }}>
          {/* Staff Table */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Staff Directory</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {roles.map(r => (
                  <button key={r} className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(r)} style={{ textTransform: 'capitalize' }}>{r}</button>
                ))}
              </div>
            </div>
            <div className="card-body" style={{ paddingTop: 10, overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Role</th>
                    <th>Zone</th>
                    <th>Status</th>
                    <th>Contact</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const sc = STATUS_CONFIG[s.status];
                    return (
                      <tr key={s.id} onClick={() => setSelected(s)} style={{ cursor: 'pointer', background: selected?.id === s.id ? 'var(--primary-light)' : '' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div className="avatar-sm" style={{ background: ROLE_COLORS[s.role] }}>{s.avatar}</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ background: ROLE_COLORS[s.role] + '22', color: ROLE_COLORS[s.role], padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>{s.role}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem' }}>
                            <MapPin size={12} color="var(--text-muted)" />{s.zone}
                          </div>
                        </td>
                        <td>
                          <span style={{ background: sc.bg, color: sc.color, padding: '3px 9px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>{sc.label}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <Phone size={12} />{s.phone}
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); setSelected(s); }}>
                            <Send size={12} /> Dispatch
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dispatch Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selected ? (
              <div className="card fade-in">
                <div className="card-header">
                  <span className="card-title">Dispatch Task</span>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px', background: 'var(--bg)', borderRadius: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: ROLE_COLORS[selected.role], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{selected.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selected.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selected.role} · {selected.zone}</div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quick Tasks</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {['Move to Gate 3', 'Assist at Stage', 'Check Zone A', 'Medical standby', 'Crowd control'].map(t => (
                        <button key={t} className="btn btn-sm btn-outline" style={{ fontSize: '0.72rem' }} onClick={() => setTaskMsg(t)}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Custom Message</label>
                    <textarea className="form-input" rows={3} value={taskMsg} onChange={e => setTaskMsg(e.target.value)} placeholder="Type task or instruction..." style={{ resize: 'vertical' }} />
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={dispatch}>
                    <Send size={15} /> Send Dispatch
                  </button>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                <UserCheck size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <p style={{ fontSize: '0.85rem' }}>Select a staff member to dispatch a task</p>
              </div>
            )}

            {/* Dispatch Log */}
            {dispatched.length > 0 && (
              <div className="card fade-in">
                <div className="card-header"><span className="card-title">Dispatch Log</span></div>
                <div className="card-body" style={{ paddingTop: 10 }}>
                  {dispatched.slice().reverse().map((d, i) => (
                    <div key={i} style={{ padding: '8px 10px', background: 'var(--success-light)', borderRadius: 8, marginBottom: 6, fontSize: '0.78rem' }}>
                      <strong>{d.staffId}</strong>: {d.msg}
                      <span style={{ float: 'right', color: 'var(--text-muted)' }}>{d.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
