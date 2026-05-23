import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Users, Bell, ShoppingBag,
  BarChart3, AlertTriangle, Zap, ChevronRight, LogOut, Settings, X
} from 'lucide-react';
import { EVENT_INFO } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { section: 'Operations', items: [
    { path: '/dashboard',   label: 'Dashboard',    icon: LayoutDashboard, badge: null },
    { path: '/heatmap',     label: 'Live Heatmap', icon: Map,             badge: null },
    { path: '/alerts',      label: 'Alerts',       icon: Bell,            badge: 4    },
    { path: '/staff',       label: 'Staff',        icon: Users,           badge: null },
  ]},
  { section: 'Intelligence', items: [
    { path: '/predictions', label: 'AI Predictions', icon: Zap,           badge: null },
    { path: '/vendors',     label: 'Vendors',         icon: ShoppingBag,   badge: null },
    { path: '/incidents',   label: 'Incidents',       icon: AlertTriangle, badge: 1    },
  ]},
  { section: 'Reports & Config', items: [
    { path: '/analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { path: '/settings',  label: 'Settings',  icon: Settings,  badge: null },
  ]},
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose(); // auto-close on mobile
  };

  return (
    <>
      {/* Overlay backdrop for mobile when open */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${!open ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="white" opacity="0.9"/>
              <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.5" opacity="0.6"/>
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1" opacity="0.3"/>
              <circle cx="12" cy="4"  r="1.5" fill="white" opacity="0.8"/>
              <circle cx="12" cy="20" r="1.5" fill="white" opacity="0.8"/>
              <circle cx="4"  cy="12" r="1.5" fill="white" opacity="0.8"/>
              <circle cx="20" cy="12" r="1.5" fill="white" opacity="0.8"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="logo-text">Crowd<span>IQ</span></div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>Intelligence Platform</div>
          </div>
          {/* Close button visible always for easy collapse */}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 6 }}
            title="Collapse sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(section => (
            <div key={section.section} className="nav-section">
              <div className="nav-section-label">{section.section}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <div
                    key={item.path}
                    className={`nav-item ${active ? 'active' : ''}`}
                    onClick={() => handleNav(item.path)}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                    {item.badge && <span className="badge">{item.badge}</span>}
                    {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.7 }} />}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="event-card-mini" style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <span className="event-live-dot" />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', opacity: 0.9 }}>LIVE EVENT</span>
            </div>
            <h4>{EVENT_INFO.name}</h4>
            <p style={{ marginTop: 3 }}>{EVENT_INFO.venue}</p>
            <p style={{ marginTop: 1 }}>{EVENT_INFO.date}</p>
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 8px', fontSize: '0.72rem', fontWeight: 600 }}>6,247 Live</div>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 8px', fontSize: '0.72rem', fontWeight: 600 }}>{EVENT_INFO.zones} Zones</div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#991B1B'; e.currentTarget.style.borderColor = '#FECACA'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <LogOut size={15} />
            Sign Out
            {user && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
