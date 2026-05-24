import { useState, useEffect, useCallback } from 'react';
import { Radio, Users, MapPin, Navigation, RefreshCw, Smartphone, Wifi, WifiOff, Activity } from 'lucide-react';
import Topbar from '../components/Topbar';
import { supabase } from '../lib/supabase';
import { getDensityColor, getDensityLevel } from '../data/mockData';

export default function Tracking({ sidebarOpen, setSidebarOpen }) {
  const [attendees, setAttendees] = useState([]);
  const [zoneCounts, setZoneCounts] = useState([]);
  const [zones, setZones] = useState([]);
  const [totalActive, setTotalActive] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [checkinUrl, setCheckinUrl] = useState('');

  // Generate the attendee check-in URL
  useEffect(() => {
    setCheckinUrl(window.location.origin + '/checkin');
  }, []);

  // Fetch zones from Supabase
  const fetchZones = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('zones').select('*').order('id');
      if (error) throw error;
      setZones(data || []);
    } catch (err) {
      console.error('Error fetching zones:', err);
    }
  }, []);

  // Fetch active attendee locations
  const fetchAttendees = useCallback(async () => {
    try {
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('attendee_locations')
        .select('*')
        .gte('updated_at', tenMinAgo)
        .eq('event_id', 'current');
      if (error) throw error;

      setAttendees(data || []);
      setTotalActive((data || []).length);

      // Count per zone
      const counts = {};
      (data || []).forEach(row => {
        const key = row.zone_id || 'outside';
        if (!counts[key]) counts[key] = { zone_id: row.zone_id, zone_name: row.zone_name || 'Outside Venue', count: 0 };
        counts[key].count++;
      });
      setZoneCounts(Object.values(counts).sort((a, b) => b.count - a.count));

      // Update zone density in Supabase based on real counts
      if (zones.length > 0) {
        for (const zone of zones) {
          const zoneCount = counts[zone.id]?.count || 0;
          const density = Math.min(100, Math.round((zoneCount / zone.capacity) * 100));
          // Only update if density changed significantly
          if (Math.abs(density - (zone.density || 0)) >= 1) {
            await supabase.from('zones').update({ density }).eq('id', zone.id);
          }
        }
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching attendees:', err);
    } finally {
      setLoading(false);
    }
  }, [zones]);

  // Initial load
  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  useEffect(() => {
    if (zones.length > 0) {
      fetchAttendees();
    }
  }, [zones, fetchAttendees]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAttendees, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAttendees]);

  // Real-time subscription to attendee_locations
  useEffect(() => {
    const channel = supabase
      .channel('tracking-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendee_locations' }, () => {
        fetchAttendees();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchAttendees]);

  const timeSince = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar
        title="Live GPS Tracking"
        subtitle={`${totalActive} attendee${totalActive !== 1 ? 's' : ''} actively tracked`}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        sidebarOpen={sidebarOpen}
      />
      <div className="page-body">

        {/* Top Stats Row */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: 20, textAlign: 'center' }}>
            <Smartphone size={22} style={{ color: 'var(--primary)', marginBottom: 8 }} />
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalActive}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Devices</div>
          </div>
          <div className="card" style={{ padding: 20, textAlign: 'center' }}>
            <MapPin size={22} style={{ color: '#10B981', marginBottom: 8 }} />
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {zoneCounts.filter(z => z.zone_id && z.zone_id !== 'outside').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Zones</div>
          </div>
          <div className="card" style={{ padding: 20, textAlign: 'center' }}>
            <Activity size={22} style={{ color: '#F59E0B', marginBottom: 8 }} />
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {zoneCounts.find(z => z.zone_id === 'outside')?.count || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Outside Zones</div>
          </div>
          <div className="card" style={{ padding: 20, textAlign: 'center' }}>
            <Navigation size={22} style={{ color: '#8B5CF6', marginBottom: 8 }} />
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {attendees.filter(a => a.accuracy && a.accuracy < 20).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>High Accuracy</div>
          </div>
        </div>

        {/* Check-in URL Card */}
        <div className="card" style={{ marginBottom: 24, padding: 20, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Radio size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Attendee Check-in Link</h3>
          </div>
          <p style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: 14 }}>
            Share this URL with attendees. When they open it on their phone and allow GPS, their location is tracked in real-time.
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.2)', padding: '10px 14px', borderRadius: 10,
              fontSize: '0.85rem', fontFamily: 'monospace', wordBreak: 'break-all', backdropFilter: 'blur(10px)'
            }}>
              {checkinUrl}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(checkinUrl)}
              style={{
                background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white',
                padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
                fontSize: '0.82rem', whiteSpace: 'nowrap'
              }}
            >
              📋 Copy
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Zone Occupancy (Real GPS Data) */}
          <div className="card" style={{ minHeight: 400 }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">
                <MapPin size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Zone Occupancy (Live GPS)
              </span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => setAutoRefresh(a => !a)}
                  style={{
                    background: autoRefresh ? 'var(--primary-light)' : 'var(--bg)',
                    border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px',
                    fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600,
                    color: autoRefresh ? 'var(--primary)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  {autoRefresh ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {autoRefresh ? 'Auto' : 'Paused'}
                </button>
                <button
                  onClick={fetchAttendees}
                  style={{
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex'
                  }}
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading GPS data...</div>
              ) : zones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No zones found. Run the SQL schema in Supabase first.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {zones.map(zone => {
                    const count = zoneCounts.find(z => z.zone_id === zone.id)?.count || 0;
                    const pct = Math.min(100, Math.round((count / zone.capacity) * 100));
                    return (
                      <div key={zone.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 10,
                        background: pct >= 80 ? 'rgba(239,68,68,0.06)' : 'var(--bg)',
                        border: `1px solid ${pct >= 80 ? 'rgba(239,68,68,0.2)' : 'var(--border-light)'}`
                      }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: getDensityColor(pct),
                          boxShadow: pct >= 80 ? '0 0 8px rgba(239,68,68,0.5)' : 'none'
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{zone.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                            {count} / {zone.capacity} people · {getDensityLevel(pct).toUpperCase()}
                          </div>
                        </div>
                        <div style={{
                          width: 80, height: 6, background: 'var(--border-light)', borderRadius: 99, overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${pct}%`, height: '100%', borderRadius: 99,
                            background: getDensityColor(pct), transition: 'width 0.5s'
                          }} />
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: getDensityColor(pct), minWidth: 35, textAlign: 'right' }}>
                          {pct}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ marginTop: 12, fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Active Devices List */}
          <div className="card" style={{ minHeight: 400 }}>
            <div className="card-header">
              <span className="card-title">
                <Smartphone size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Active Devices ({totalActive})
              </span>
            </div>
            <div className="card-body" style={{ maxHeight: 500, overflowY: 'auto' }}>
              {attendees.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <Smartphone size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 4 }}>No active devices</div>
                  <div style={{ fontSize: '0.78rem' }}>Share the check-in link above with attendees to start tracking</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {attendees.map(a => (
                    <div key={a.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8,
                      background: 'var(--bg)', border: '1px solid var(--border-light)'
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', background: '#10B981',
                        animation: 'pulse 2s ease-in-out infinite'
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {a.zone_name || 'Outside Venue'}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Device: {a.device_id?.substring(0, 8)}... · Accuracy: {a.accuracy ? `±${Math.round(a.accuracy)}m` : 'N/A'}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {timeSince(a.updated_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
