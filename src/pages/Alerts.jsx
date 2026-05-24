import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Bell, Clock } from 'lucide-react';
import Topbar from '../components/Topbar';
import { fetchAlerts, resolveAlert } from '../lib/supabaseService';

const TYPE_LABEL = { danger: 'Critical', warning: 'Warning', info: 'Info', success: 'Resolved', critical: 'Critical' };
const borderColor = (type) => ({ danger: '#EF4444', warning: '#F59E0B', critical: '#EF4444', info: '#3B82F6', success: '#10B981' }[type] || '#94A3B8');

export default function Alerts({ sidebarOpen, setSidebarOpen }) {
  const [filter, setFilter] = useState('all');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAlerts(); }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(id) {
    try {
      const updated = await resolveAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? updated : a));
    } catch (err) {
      console.error('Resolve failed:', err);
    }
  }


  const filtered = filter === 'all' ? alerts
    : filter === 'active'  ? alerts.filter(a => !a.resolved)
    : alerts.filter(a => a.type === filter);

  const counts = {
    all:     alerts.length,
    active:  alerts.filter(a => !a.resolved).length,
    danger:  alerts.filter(a => a.type === 'danger' || a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Alerts & Incidents" subtitle="Real-time operational warnings"
        onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      <div className="page-body">

        {/* Summary Cards */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          {[
            { label: 'Total Alerts', value: counts.all,     color: 'indigo', icon: Bell },
            { label: 'Active',       value: counts.active,  color: 'red',    icon: AlertTriangle },
            { label: 'Critical',     value: counts.danger,  color: 'red',    icon: AlertTriangle },
            { label: 'Warnings',     value: counts.warning, color: 'amber',  icon: Clock },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className={`stat-card ${color}`}>
              <div className={`stat-icon ${color}`}><Icon size={18} /></div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="tabs" style={{ marginBottom: 20 }}>
          {[['all','All'],['active','Active'],['danger','Critical'],['warning','Warning']].map(([key, label]) => (
            <button key={key} className={`tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>{label}</button>
          ))}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={loadAlerts}>↻ Refresh</button>
        </div>

        {/* Alert Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading alerts...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(alert => (
              <div key={alert.id} className="card slide-in" style={{ borderLeft: `4px solid ${borderColor(alert.type)}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                  <div className={`alert-icon ${alert.type === 'critical' ? 'danger' : alert.type}`} style={{ width: 44, height: 44, borderRadius: 10 }}>
                    {alert.resolved ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{alert.title}</span>
                      <span className={`badge-status ${alert.resolved ? 'safe' : alert.type === 'danger' || alert.type === 'critical' ? 'critical' : 'moderate'}`}>
                        {alert.resolved ? 'Resolved' : TYPE_LABEL[alert.type] || 'Alert'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 3 }}>{alert.description || alert.desc}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 12 }}>
                      <span>📍 {alert.zone}</span>
                      <span>🕐 {alert.time || new Date(alert.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <button className="btn btn-sm btn-primary" onClick={() => handleResolve(alert.id)}>
                      <CheckCircle size={14} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
