import { useState, useEffect, useCallback } from 'react';
import { Phone, MapPin, UserCheck, Send, Smartphone, ShieldAlert, Check } from 'lucide-react';
import Topbar from '../components/Topbar';
import { getDensityLevel, getDensityColor } from '../data/mockData';
import { fetchStaff, logDispatch, fetchZones, updateZoneDensity, createIncident, logAutomatedAction } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';

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
  const [activeTab, setActiveTab] = useState('ops'); // 'ops' or 'simulator'
  
  // Real database states
  const [staff, setStaff] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ops States
  const [selected, setSelected] = useState(null);
  const [taskMsg, setTaskMsg] = useState('');
  const [filter, setFilter] = useState('all');
  const [dispatched, setDispatched] = useState([]);
  const [sending, setSending] = useState(false);

  // Simulator States
  const [simStaffId, setSimStaffId] = useState('');
  const [simZoneId, setSimZoneId] = useState('');
  const [reporting, setReporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [staffData, zonesData] = await Promise.all([
        fetchStaff(),
        fetchZones()
      ]);
      setStaff(staffData);
      setZones(zonesData);
    } catch (err) {
      console.error('Error loading staff/zones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // ── Supabase Realtime Channels ──────────────────────────────
    const staffChannel = supabase
      .channel('staff-view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setStaff(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
        } else if (payload.eventType === 'INSERT') {
          setStaff(prev => [...prev, payload.new]);
        }
      })
      .subscribe();

    const zonesChannel = supabase
      .channel('staff-zones')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'zones' }, (payload) => {
        setZones(prev => prev.map(z => z.id === payload.new.id ? payload.new : z));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(staffChannel);
      supabase.removeChannel(zonesChannel);
    };
  }, [loadData]);

  const dispatch = async () => {
    if (!taskMsg.trim() || !selected) return;
    const entry = { staffId: selected.name, msg: taskMsg, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setSending(true);
    try {
      await logDispatch({ staffId: selected.id, message: taskMsg });
      
      // Update local dispatch indicator
      setDispatched(prev => [...prev, entry]);
      setTaskMsg('');
    } catch (e) {
      console.error('Dispatch log failed:', e.message);
    } finally {
      setSending(false);
    }
  };

  // Mobile Status Reporter
  const handleStatusReport = async (densityPct, label) => {
    if (!simZoneId) return;
    setReporting(true);
    setSuccessMsg('');
    try {
      // 1. Update density in public.zones
      await updateZoneDensity(simZoneId, densityPct);

      const zoneObj = zones.find(z => z.id === simZoneId);
      const zoneName = zoneObj?.name || 'Unknown Zone';

      // 2. Log automated chain of safety actions if RED/Critical
      if (densityPct >= 80) {
        // Log critical incident
        await createIncident({
          title: 'Crowd Bottleneck Reported',
          zone: zoneName,
          type: 'Crowd',
          severity: 'critical',
          description: `Ground staff reported critical density level of ${densityPct}% at ${zoneName}.`
        });

        // Insert database alert
        await supabase.from('alerts').insert([{
          title: 'Critical Overcrowding',
          zone: zoneName,
          type: 'danger',
          description: `Live density exceeds 80% capacity at ${zoneName}. Staff reported bottleneck.`,
          resolved: false
        }]);

        // Log automated dispersion action
        await logAutomatedAction({
          zone: zoneName,
          title: 'Crowd Dispersion Alert Sent',
          description: `Push notifications broadcasted to attendees near ${zoneName}: 'Head to other zones for 15% discount!'`,
          triggered_by: 'critical_density'
        });
      }

      setSuccessMsg(`Report sent! Zone updated to ${label} (${densityPct}%).`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Status report failed:', err);
    } finally {
      setReporting(false);
    }
  };

  const filtered = filter === 'all' ? staff : staff.filter(s => s.role === filter || s.status === filter);
  const roles = ['all', ...new Set(staff.map(s => s.role))];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar title="Staff Management" subtitle="Loading staff..." onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
          <div className="spinner" style={{ border: '4px solid rgba(99,102,241,0.1)', borderLeft: '4px solid var(--primary)', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar 
        title="Staff Management" 
        subtitle={`${staff.length} staff members synchronized with Supabase Database`} 
        onToggleSidebar={() => setSidebarOpen(o => !o)} 
        sidebarOpen={sidebarOpen} 
      />
      
      {/* Navigation Tabs */}
      <div style={{ background: 'white', padding: '8px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
        <button 
          className={`btn btn-sm ${activeTab === 'ops' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('ops')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <UserCheck size={14} /> Operations Control
        </button>
        <button 
          className={`btn btn-sm ${activeTab === 'simulator' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('simulator')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Smartphone size={14} /> Ground Staff App Simulator
        </button>
      </div>

      <div className="page-body">
        {activeTab === 'ops' ? (
          <>
            {/* Summary */}
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
              {[
                { label: 'Active', value: staff.filter(s=>s.status==='active').length, color: 'green' },
                { label: 'Busy', value: staff.filter(s=>s.status==='busy').length, color: 'amber' },
                { label: 'Offline', value: staff.filter(s=>s.status==='offline').length, color: 'red' },
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
                        const sc = STATUS_CONFIG[s.status] || STATUS_CONFIG['offline'];
                        return (
                          <tr key={s.id} onClick={() => setSelected(s)} style={{ cursor: 'pointer', background: selected?.id === s.id ? 'var(--primary-light)' : '' }}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                <div className="avatar-sm" style={{ background: ROLE_COLORS[s.role] || '#8B5CF6' }}>{s.avatar}</div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.name}</div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.id}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ background: (ROLE_COLORS[s.role] || '#8B5CF6') + '22', color: ROLE_COLORS[s.role] || '#8B5CF6', padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>{s.role}</span>
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
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: ROLE_COLORS[selected.role] || '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{selected.avatar}</div>
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
                      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={dispatch} disabled={sending}>
                        <Send size={15} /> {sending ? 'Sending...' : 'Send Dispatch'}
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
          </>
        ) : (
          /* Mobile Ground Staff Simulator View */
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <div style={{ width: 375, border: '12px solid #1E293B', borderRadius: 36, background: '#F8FAFC', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 640 }}>
              
              {/* Simulator Phone Header */}
              <div style={{ background: '#1E293B', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 600 }}>
                <span>📶 LTE</span>
                <span>CrowdIQ Ground</span>
                <span>🔋 98%</span>
              </div>
              
              {/* Phone App Navbar */}
              <div style={{ background: 'var(--primary)', padding: '14px 16px', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Smartphone size={16} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Ground Reporting Portal</span>
              </div>
              
              {/* Simulator Phone Body */}
              <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Intro card */}
                <div style={{ background: 'white', borderRadius: 12, padding: 14, border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Welcome to the <strong>CrowdIQ Ground Staff App</strong>. As an usher, reporting crowd levels verifies passive sensor metrics in real-time.
                  </p>
                </div>

                {/* Form fields */}
                <div className="card" style={{ padding: 14, background: 'white' }}>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Your Identity</label>
                    <select className="form-input" style={{ fontSize: '0.78rem', height: 38 }} value={simStaffId} onChange={e => setSimStaffId(e.target.value)}>
                      <option value="">-- Select Staff ID --</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 4 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Assigned Zone</label>
                    <select className="form-input" style={{ fontSize: '0.78rem', height: 38 }} value={simZoneId} onChange={e => setSimZoneId(e.target.value)}>
                      <option value="">-- Select Zone --</option>
                      {zones.map(z => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Active Zone Density Indicator */}
                {simZoneId && (() => {
                  const activeZone = zones.find(z => z.id === simZoneId);
                  const pct = activeZone?.density || 0;
                  const level = getDensityLevel(pct);
                  const color = getDensityColor(pct);
                  return (
                    <div style={{ background: 'white', borderRadius: 12, padding: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Current Registered Density</span>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color, fontFamily: 'var(--font-display)', margin: '4px 0' }}>{pct}%</div>
                      <span className={`badge-status ${level}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>{level}</span>
                    </div>
                  );
                })()}

                {/* Verification buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldAlert size={12} color="var(--primary)" /> Tap to verify zone condition:
                  </span>
                  
                  <button 
                    onClick={() => handleStatusReport(30, 'Safe')} 
                    className="btn" 
                    disabled={!simZoneId || reporting} 
                    style={{ background: '#10B981', color: 'white', fontSize: '0.82rem', padding: '10px 0', border: 'none', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'opacity 0.2s' }}
                  >
                    🟢 Safe Level (30%)
                  </button>

                  <button 
                    onClick={() => handleStatusReport(65, 'Moderate')} 
                    className="btn" 
                    disabled={!simZoneId || reporting} 
                    style={{ background: '#F59E0B', color: 'white', fontSize: '0.82rem', padding: '10px 0', border: 'none', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'opacity 0.2s' }}
                  >
                    🟡 Moderate Congestion (65%)
                  </button>

                  <button 
                    onClick={() => handleStatusReport(90, 'Critical')} 
                    className="btn" 
                    disabled={!simZoneId || reporting} 
                    style={{ background: '#EF4444', color: 'white', fontSize: '0.82rem', padding: '10px 0', border: 'none', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'opacity 0.2s' }}
                  >
                    🔴 Critical Overcrowding (90%)
                  </button>
                </div>

                {/* Notifications & Status */}
                {successMsg && (
                  <div style={{ padding: '8px 12px', background: 'var(--success-light)', color: 'var(--success)', border: '1px solid #A7F3D0', borderRadius: 8, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6, animation: 'fadeIn 0.2s ease-out' }}>
                    <Check size={14} /> {successMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
