import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Haversine distance formula (meters)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Fallback zones (used if Supabase fetch fails)
const FALLBACK_ZONES = [
  { id: 'Z1', name: 'Main Stage', lat: 19.0765, lng: 72.8773, radius_meters: 80 },
  { id: 'Z2', name: 'North Entrance', lat: 19.0780, lng: 72.8768, radius_meters: 40 },
  { id: 'Z3', name: 'Food Court A', lat: 19.0758, lng: 72.8780, radius_meters: 50 },
  { id: 'Z4', name: 'Tech Expo Hall', lat: 19.0760, lng: 72.8760, radius_meters: 70 },
  { id: 'Z5', name: 'Workshop Zone', lat: 19.0748, lng: 72.8775, radius_meters: 35 },
  { id: 'Z6', name: 'South Exit', lat: 19.0750, lng: 72.8763, radius_meters: 40 },
  { id: 'Z7', name: 'VIP Lounge', lat: 19.0770, lng: 72.8785, radius_meters: 30 },
  { id: 'Z8', name: 'Parking A', lat: 19.0785, lng: 72.8780, radius_meters: 60 },
  { id: 'Z9', name: 'First Aid', lat: 19.0755, lng: 72.8770, radius_meters: 20 },
  { id: 'Z10', name: 'Media Centre', lat: 19.0762, lng: 72.8790, radius_meters: 25 },
  { id: 'Z11', name: 'Food Court B', lat: 19.0742, lng: 72.8768, radius_meters: 50 },
  { id: 'Z12', name: 'Emergency Gate', lat: 19.0775, lng: 72.8758, radius_meters: 35 },
];

function getDeviceId() {
  let id = localStorage.getItem('crowdiq_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('crowdiq_device_id', id);
  }
  return id;
}

async function upsertLocation({ deviceId, latitude, longitude, accuracy, zoneId, zoneName }) {
  const { data: existing } = await supabase
    .from('attendee_locations')
    .select('id')
    .eq('device_id', deviceId)
    .eq('event_id', 'current')
    .maybeSingle();

  if (existing) {
    await supabase.from('attendee_locations')
      .update({ latitude, longitude, accuracy, zone_id: zoneId, zone_name: zoneName, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase.from('attendee_locations')
      .insert([{ device_id: deviceId, latitude, longitude, accuracy, zone_id: zoneId, zone_name: zoneName, event_id: 'current' }]);
  }
}

async function removeLocation(deviceId) {
  await supabase.from('attendee_locations')
    .delete()
    .eq('device_id', deviceId)
    .eq('event_id', 'current');
}

export default function AttendeeCheckin() {
  const [status, setStatus] = useState('idle'); // idle, requesting, tracking, error, checkedout
  const [position, setPosition] = useState(null);
  const [currentZone, setCurrentZone] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState('');
  const [zones, setZones] = useState(FALLBACK_ZONES);
  const [lastSent, setLastSent] = useState(null);
  const [sendCount, setSendCount] = useState(0);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const deviceId = useRef(getDeviceId());

  // Fetch real zones from Supabase
  useEffect(() => {
    async function loadZones() {
      try {
        const { data } = await supabase.from('zones').select('id, name, lat, lng, radius_meters');
        if (data && data.length > 0) setZones(data);
      } catch (e) {
        console.warn('Using fallback zones:', e);
      }
    }
    loadZones();
  }, []);

  // Determine which zone the attendee is in
  const detectZone = useCallback((lat, lng) => {
    let closest = null;
    let closestDist = Infinity;

    for (const zone of zones) {
      const dist = haversineDistance(lat, lng, zone.lat, zone.lng);
      const radius = zone.radius_meters || 50;
      if (dist <= radius && dist < closestDist) {
        closest = zone;
        closestDist = dist;
      }
    }
    return closest;
  }, [zones]);

  // Send location to Supabase
  const sendLocation = useCallback(async (lat, lng, acc) => {
    const zone = detectZone(lat, lng);
    setCurrentZone(zone);
    try {
      await upsertLocation({
        deviceId: deviceId.current,
        latitude: lat,
        longitude: lng,
        accuracy: acc,
        zoneId: zone?.id || null,
        zoneName: zone?.name || null
      });
      setLastSent(new Date());
      setSendCount(c => c + 1);
    } catch (e) {
      console.error('Failed to send location:', e);
    }
  }, [detectZone]);

  // Start GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('GPS is not supported by your browser.');
      setStatus('error');
      return;
    }

    setStatus('requesting');
    setError('');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setAccuracy(acc);
        setStatus('tracking');

        // Send immediately on first position
        sendLocation(latitude, longitude, acc);
      },
      (err) => {
        if (err.code === 1) {
          setError('Location permission denied. Please allow GPS access and try again.');
        } else if (err.code === 2) {
          setError('Unable to determine your location. Please try again.');
        } else {
          setError('Location request timed out. Please try again.');
        }
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    // Send location every 30 seconds
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy: acc } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
          setAccuracy(acc);
          sendLocation(latitude, longitude, acc);
        },
        () => {}, // silently fail interval updates
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    }, 30000);
  };

  // Stop tracking and check out
  const checkout = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    try {
      await removeLocation(deviceId.current);
    } catch (e) {
      console.error('Checkout error:', e);
    }
    setStatus('checkedout');
    setPosition(null);
    setCurrentZone(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const s = {
    shell: {
      minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: 'white',
    },
    card: {
      background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
      borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)',
      padding: '32px 28px', maxWidth: 420, width: '100%',
    },
    logo: {
      display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 24,
    },
    logoIcon: {
      width: 36, height: 36, borderRadius: 10,
      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    btn: {
      width: '100%', padding: '14px', borderRadius: 14, border: 'none',
      fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
      transition: 'all 0.2s',
    },
    zoneBadge: {
      padding: '16px 20px', borderRadius: 16, textAlign: 'center', marginBottom: 16,
    },
    stat: {
      display: 'flex', justifyContent: 'space-between', padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.82rem',
    },
  };

  return (
    <div style={s.shell}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logo}>
          <div style={s.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="white" opacity="0.9" />
              <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.5" opacity="0.6" />
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1" opacity="0.3" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Crowd<span style={{ color: '#818CF8' }}>IQ</span></div>
            <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>Live Event Tracking</div>
          </div>
        </div>

        {/* Event Info */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Tech Summit 2026</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: 4 }}>NESCO Exhibition Centre, Mumbai</div>
        </div>

        {/* ── IDLE STATE ── */}
        {status === 'idle' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📍</div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.6 }}>
                Check in to share your live location with the event organizer. This helps manage crowd density and keep everyone safe.
              </p>
            </div>
            <button
              onClick={startTracking}
              style={{ ...s.btn, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white' }}
            >
              📍 Check In &amp; Start Tracking
            </button>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.72rem', opacity: 0.5 }}>
              🔒 Your location is anonymous. We only track zone density, not your identity.
            </div>
          </>
        )}

        {/* ── REQUESTING PERMISSION ── */}
        {status === 'requesting' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }}>📡</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Requesting GPS Access...</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Please tap "Allow" when your browser asks for location permission.</div>
          </div>
        )}

        {/* ── TRACKING STATE ── */}
        {status === 'tracking' && (
          <>
            {/* Current Zone */}
            <div style={{
              ...s.zoneBadge,
              background: currentZone
                ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))'
                : 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))',
              border: `1px solid ${currentZone ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
            }}>
              <div style={{
                display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                background: currentZone ? '#10B981' : '#F59E0B', marginRight: 8,
                boxShadow: `0 0 10px ${currentZone ? '#10B981' : '#F59E0B'}`,
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                {currentZone ? currentZone.name : 'Outside Venue Zones'}
              </span>
              <div style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: 6 }}>
                {currentZone ? `You are inside the ${currentZone.name} zone` : 'Move closer to a venue zone to be detected'}
              </div>
            </div>

            {/* Stats */}
            <div style={{ marginBottom: 20 }}>
              <div style={s.stat}>
                <span style={{ opacity: 0.6 }}>GPS Accuracy</span>
                <span style={{ fontWeight: 600, color: accuracy && accuracy < 20 ? '#10B981' : '#F59E0B' }}>
                  ±{accuracy ? Math.round(accuracy) : '—'}m
                </span>
              </div>
              <div style={s.stat}>
                <span style={{ opacity: 0.6 }}>Latitude</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {position?.lat?.toFixed(6) || '—'}
                </span>
              </div>
              <div style={s.stat}>
                <span style={{ opacity: 0.6 }}>Longitude</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {position?.lng?.toFixed(6) || '—'}
                </span>
              </div>
              <div style={s.stat}>
                <span style={{ opacity: 0.6 }}>Updates Sent</span>
                <span style={{ fontWeight: 600 }}>{sendCount}</span>
              </div>
              <div style={{ ...s.stat, borderBottom: 'none' }}>
                <span style={{ opacity: 0.6 }}>Last Update</span>
                <span style={{ fontWeight: 600 }}>
                  {lastSent ? lastSent.toLocaleTimeString() : '—'}
                </span>
              </div>
            </div>

            {/* Live indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 20, padding: '10px', borderRadius: 12,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: '#10B981',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10B981' }}>
                Live — Sending location every 30 seconds
              </span>
            </div>

            <button
              onClick={checkout}
              style={{ ...s.btn, background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              ✕ Check Out &amp; Stop Tracking
            </button>
          </>
        )}

        {/* ── ERROR STATE ── */}
        {status === 'error' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
              <div style={{
                padding: '12px 16px', borderRadius: 12,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                fontSize: '0.82rem', color: '#FCA5A5', lineHeight: 1.5,
              }}>
                {error}
              </div>
            </div>
            <button
              onClick={startTracking}
              style={{ ...s.btn, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white' }}
            >
              🔄 Try Again
            </button>
          </>
        )}

        {/* ── CHECKED OUT STATE ── */}
        {status === 'checkedout' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>👋</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Checked Out!</div>
              <p style={{ fontSize: '0.82rem', opacity: 0.6, lineHeight: 1.5 }}>
                Your location tracking has stopped. Your data has been removed. Thank you for attending!
              </p>
            </div>
            <button
              onClick={() => { setStatus('idle'); setSendCount(0); }}
              style={{ ...s.btn, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              ↩ Check In Again
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.7rem', opacity: 0.4 }}>
        Powered by CrowdIQ · Privacy-first crowd intelligence
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
      `}</style>
    </div>
  );
}
