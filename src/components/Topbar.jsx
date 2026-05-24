import { useState, useCallback, useEffect, useRef } from 'react';
import { Bell, RefreshCw, Menu, X, Settings, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchAlerts, resolveAlert as dbResolveAlert } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';

export default function Topbar({ title, subtitle, onRefresh, onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [spinning, setSpinning] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  // Dynamic live alerts state
  const [alerts, setAlerts] = useState([]);
  const notifRef = useRef(null);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Topbar alerts failed:', err);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    loadAlerts();

    // ── Supabase Realtime Alerts Channel ────────────────────────
    const alertsChannel = supabase
      .channel('topbar-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAlerts(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setAlerts(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
    };
  }, [loadAlerts]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRefresh = () => {
    setSpinning(true);
    if (onRefresh) onRefresh();
    loadAlerts();
    setTimeout(() => setSpinning(false), 900);
  };

  const resolveAlert = async (id) => {
    try {
      const updated = await dbResolveAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? updated : a));
    } catch (err) {
      console.error('Failed to resolve alert from topbar:', err);
      // Fallback local resolve
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, type: 'success' } : a));
    }
  };

  const unread = alerts.filter(a => !a.resolved).length;
  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <header className="topbar" style={{ position: 'relative', zIndex: 200 }}>
      {/* Hamburger */}
      <button
        className="btn-icon"
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        style={{ marginRight: 4 }}
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="topbar-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</div>}
      </div>

      <div className="topbar-right">
        {/* Live Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', animation: 'pulse-dot 1.5s infinite', flexShrink: 0 }} />
          {timeStr}
        </div>

        <div className="live-indicator">
          <div className="live-dot" />
          LIVE
        </div>

        {/* Refresh */}
        <button className="btn-icon" title="Refresh data" onClick={handleRefresh}>
          <RefreshCw size={16} style={{ transition: 'transform 0.8s ease', transform: spinning ? 'rotate(360deg)' : 'none' }} />
        </button>

        {/* Notification Bell with dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            id="notif-btn"
            className="btn-icon"
            title="Notifications"
            onClick={() => setNotifOpen(o => !o)}
            style={{ background: notifOpen ? 'var(--primary-light)' : '', borderColor: notifOpen ? 'var(--primary)' : '' }}
          >
            <Bell size={16} />
            {unread > 0 && (
              <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 17, height: 17, background: '#EF4444', borderRadius: 99, border: '2px solid white', fontSize: '0.6rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {notifOpen && (
            <div id="notif-panel" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 360, background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', zIndex: 9999, animation: 'fadeInUp 0.2s ease' }}>
              {/* Panel Header */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Notifications</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>{unread} unresolved alerts</div>
                </div>
                <button
                  style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-light)', border: 'none', padding: '4px 10px', borderRadius: 99, cursor: 'pointer' }}
                  onClick={async () => {
                    const unreadAlerts = alerts.filter(a => !a.resolved);
                    await Promise.all(unreadAlerts.map(a => resolveAlert(a.id)));
                  }}
                >
                  Mark all read
                </button>
              </div>

              {/* Alert List - scrollable */}
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {alerts.length === 0 ? (
                  <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    🎉 No active alerts
                  </div>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: alert.resolved ? 'white' : '#FAFBFF', transition: 'background 0.2s' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: alert.type === 'danger' || alert.type === 'critical' ? '#FEE2E2' : alert.type === 'warning' ? '#FEF3C7' : alert.type === 'success' ? '#D1FAE5' : '#DBEAFE', color: alert.type === 'danger' || alert.type === 'critical' ? '#EF4444' : alert.type === 'warning' ? '#F59E0B' : alert.type === 'success' ? '#10B981' : '#3B82F6' }}>
                        {alert.resolved ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.title}</span>
                          {!alert.resolved && (
                            <button onClick={() => resolveAlert(alert.id)} style={{ flexShrink: 0, fontSize: '0.65rem', fontWeight: 700, background: '#D1FAE5', color: '#065F46', border: 'none', padding: '2px 7px', borderRadius: 99, cursor: 'pointer' }}>Resolve</button>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{alert.zone}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                          {new Date(alert.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <span
                  onClick={() => { navigate('/alerts'); setNotifOpen(false); }}
                  style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                >
                  View all alerts →
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          className="btn-icon"
          title="Settings"
          onClick={() => navigate('/settings')}
        >
          <Settings size={16} />
        </button>

        {/* User + sign out */}
        {user && (
          <div
            onClick={logout}
            title="Click to sign out"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
          >
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Sign out</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
