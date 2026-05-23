import { useState } from 'react';
import { AlertTriangle, CheckCircle, Filter, Bell, Clock } from 'lucide-react';
import Topbar from '../components/Topbar';
import { ALERTS } from '../data/mockData';

const TYPE_ICON = { danger: '🔴', warning: '🟡', info: '🔵', success: '🟢' };
const TYPE_LABEL = { danger: 'Critical', warning: 'Warning', info: 'Info', success: 'Resolved' };

export default function Alerts({ sidebarOpen, setSidebarOpen }) {
  const [filter, setFilter] = useState('all');
  const [alerts, setAlerts] = useState(ALERTS);

  const resolve = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, type: 'success' } : a));

  const filtered = filter === 'all' ? alerts : filter === 'active' ? alerts.filter(a => !a.resolved) : alerts.filter(a => a.type === filter);

  const counts = { all: alerts.length, active: alerts.filter(a => !a.resolved).length, danger: alerts.filter(a => a.type === 'danger').length, warning: alerts.filter(a => a.type === 'warning').length };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Alerts & Incidents" subtitle="Real-time operational warnings" onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      <div className="page-body">

        {/* Summary Cards */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          {[
            { label: 'Total Alerts', value: counts.all, color: 'indigo', icon: Bell },
            { label: 'Active', value: counts.active, color: 'red', icon: AlertTriangle },
            { label: 'Critical', value: counts.danger, color: 'red', icon: AlertTriangle },
            { label: 'Warnings', value: counts.warning, color: 'amber', icon: Clock },
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
          {[['all', 'All'], ['active', 'Active'], ['danger', 'Critical'], ['warning', 'Warning']].map(([key, label]) => (
            <button key={key} className={`tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>

        {/* Alert Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(alert => (
            <div key={alert.id} className={`card slide-in`} style={{ borderLeft: `4px solid ${alert.type === 'danger' ? '#EF4444' : alert.type === 'warning' ? '#F59E0B' : alert.type === 'success' ? '#10B981' : '#3B82F6'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                <div className={`alert-icon ${alert.type}`} style={{ width: 44, height: 44, borderRadius: 10 }}>
                  {alert.resolved ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{alert.title}</span>
                    <span className={`badge-status ${alert.resolved ? 'safe' : alert.type === 'danger' ? 'critical' : 'moderate'}`}>
                      {alert.resolved ? 'Resolved' : TYPE_LABEL[alert.type]}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 3 }}>{alert.desc}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 12 }}>
                    <span>📍 {alert.zone}</span>
                    <span>🕐 {alert.time}</span>
                  </div>
                </div>
                {!alert.resolved && (
                  <button className="btn btn-sm btn-primary" onClick={() => resolve(alert.id)}>
                    <CheckCircle size={14} /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
