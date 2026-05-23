import { useState, useEffect, useCallback } from 'react';
import { Users, AlertTriangle, TrendingUp, TrendingDown, Activity, Zap, Shield, Wifi, WifiOff } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Topbar from '../components/Topbar';
import { CROWD_TIMELINE, ZONES, PREDICTIONS, getDensityLevel, getDensityColor } from '../data/mockData';
import { useSocket } from '../hooks/useSocket';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow)' }}>
        <p style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color, fontSize: '0.78rem', fontWeight: 600 }}>{p.name}: {p.value?.toLocaleString()}</p>)}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ sidebarOpen, setSidebarOpen }) {
  const { connected, liveCrowd, zoneDensities, liveAlerts } = useSocket();
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    setLastRefreshed(new Date());
  }, []);

  // Use real densities from backend or fall back to mock
  const getZonePct = (zoneId) => zoneDensities[zoneId] ?? ({ Z1:94,Z2:68,Z3:89,Z4:62,Z5:28,Z6:18,Z7:35,Z8:22,Z9:12,Z10:55,Z11:64,Z12:15 }[zoneId] || 30);

  const activeAlerts = liveAlerts.filter(a => !a.resolved);
  const criticalZones = ZONES.filter(z => getDensityLevel(getZonePct(z.id)) === 'critical');
  const displayCrowd = liveCrowd || 6247;
  const lastStr = lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar
        title="Operations Dashboard"
        subtitle={`Tech Summit 2026 — NESCO, Mumbai · Last updated: ${lastStr}`}
        onRefresh={handleRefresh}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        sidebarOpen={sidebarOpen}
      />
      <div className="page-body">

        {/* Backend status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16, padding: '7px 14px', background: connected ? '#D1FAE5' : '#FEF3C7', border: `1px solid ${connected ? '#A7F3D0' : '#FDE68A'}`, borderRadius: 99, width: 'fit-content', fontSize: '0.75rem', fontWeight: 600, color: connected ? '#065F46' : '#92400E' }}>
          {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
          {connected ? '🟢 Backend Connected — Real-time data active' : '🟡 Using simulated data — Start backend with: node server/index.js'}
        </div>

        {/* Stats */}
        <div className="stat-grid fade-in" key={`stats-${refreshKey}`}>
          <div className="stat-card indigo">
            <div className="stat-icon indigo"><Users size={20} /></div>
            <div className="stat-value">{displayCrowd.toLocaleString()}</div>
            <div className="stat-label">Live Attendees</div>
            <span className="stat-change up"><TrendingUp size={11} /> +2.3% this hour</span>
          </div>
          <div className="stat-card red">
            <div className="stat-icon red"><AlertTriangle size={20} /></div>
            <div className="stat-value">{activeAlerts.length}</div>
            <div className="stat-label">Active Alerts</div>
            <span className="stat-change down"><AlertTriangle size={11} /> 2 critical</span>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><Shield size={20} /></div>
            <div className="stat-value">{Math.round(displayCrowd / 80)}%</div>
            <div className="stat-label">Venue Capacity</div>
            <span className="stat-change up"><TrendingUp size={11} /> Peak expected 15:30</span>
          </div>
          <div className="stat-card amber">
            <div className="stat-icon amber"><Activity size={20} /></div>
            <div className="stat-value">84</div>
            <div className="stat-label">Staff On-Duty</div>
            <span className="stat-change up"><TrendingUp size={11} /> 76 active, 8 on break</span>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon blue"><Zap size={20} /></div>
            <div className="stat-value">{criticalZones.length}</div>
            <div className="stat-label">Critical Zones</div>
            <span className="stat-change down"><TrendingDown size={11} /> Needs attention</span>
          </div>
        </div>

        <div className="grid-main-aside">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Crowd Flow Chart */}
            <div className="card fade-in">
              <div className="card-header">
                <span className="card-title">Live Crowd Flow Timeline</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today · {connected ? 'Backend live' : 'Simulated'}</span>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={CROWD_TIMELINE} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gStage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="attendees" name="Total" stroke="#6366F1" strokeWidth={2.5} fill="url(#gTotal)" />
                    <Area type="monotone" dataKey="stage" name="Main Stage" stroke="#EF4444" strokeWidth={2} fill="url(#gStage)" />
                    <Area type="monotone" dataKey="foodA" name="Food Court" stroke="#F59E0B" strokeWidth={2} fill="none" strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Zone Density */}
            <div className="card fade-in">
              <div className="card-header">
                <span className="card-title">Zone Density Overview</span>
                <span style={{ fontSize: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>12 Zones</span>
              </div>
              <div className="card-body">
                {ZONES.map(zone => {
                  const pct = getZonePct(zone.id);
                  const level = getDensityLevel(pct);
                  return (
                    <div key={zone.id} className="zone-row">
                      <div style={{ minWidth: 120 }}>
                        <div className="zone-name">{zone.name}</div>
                        <div className="zone-count">{Math.round(zone.capacity * pct / 100)} / {zone.capacity}</div>
                      </div>
                      <div className="zone-bar-wrap">
                        <div className={`zone-bar ${level}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`badge-status ${level}`}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Active Alerts */}
            <div className="card fade-in">
              <div className="card-header">
                <span className="card-title">🔴 Active Alerts</span>
                <span style={{ background: 'var(--danger-light)', color: 'var(--danger)', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>{activeAlerts.length} Open</span>
              </div>
              <div className="card-body" style={{ paddingTop: 12, maxHeight: 340, overflowY: 'auto' }}>
                {activeAlerts.map(alert => (
                  <div key={alert.id} className={`alert-item ${alert.type}`}>
                    <div className={`alert-icon ${alert.type}`}><AlertTriangle size={15} /></div>
                    <div>
                      <div className="alert-title">{alert.title}</div>
                      <div className="alert-desc">{alert.zone} · {alert.desc}</div>
                      <div className="alert-time">{alert.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Predictions */}
            <div className="card fade-in">
              <div className="card-header"><span className="card-title">⚡ AI Predictions</span></div>
              <div className="card-body" style={{ paddingTop: 12 }}>
                {PREDICTIONS.map((p, i) => (
                  <div key={i} className="prediction-box" style={{ marginBottom: i < PREDICTIONS.length - 1 ? 10 : 0 }}>
                    <h4>
                      <span style={{ background: p.risk==='HIGH'?'#FEE2E2':p.risk==='MEDIUM'?'#FEF3C7':'#D1FAE5', color: p.risk==='HIGH'?'#991B1B':p.risk==='MEDIUM'?'#92400E':'#065F46', padding:'2px 7px',borderRadius:99,fontSize:'0.68rem' }}>{p.risk}</span>
                      {p.zone}
                    </h4>
                    <p style={{ fontSize:'0.78rem',color:'var(--text-secondary)',marginBottom:6 }}>{p.prediction}</p>
                    <p style={{ fontSize:'0.75rem',color:'var(--primary)',fontWeight:600 }}>→ {p.action}</p>
                    <div style={{ marginTop:6,display:'flex',alignItems:'center',gap:6 }}>
                      <div style={{ flex:1,height:4,background:'#E0E7FF',borderRadius:99 }}>
                        <div style={{ width:`${p.confidence}%`,height:'100%',background:'var(--primary)',borderRadius:99 }} />
                      </div>
                      <span style={{ fontSize:'0.7rem',fontWeight:700,color:'var(--primary)' }}>{p.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
