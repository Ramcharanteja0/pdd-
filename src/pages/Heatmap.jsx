import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Navigation, Users, AlertTriangle, Wifi } from 'lucide-react';
import Topbar from '../components/Topbar';
import { ZONES, getZoneDensity, getDensityLevel, getDensityColor } from '../data/mockData';

function MapLegend() {
  return (
    <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 1000, background: 'white', borderRadius: 12, padding: '14px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>Crowd Density</p>
      {[['#10B981', 'Safe (< 55%)'], ['#F59E0B', 'Moderate (55–80%)'], ['#EF4444', 'Critical (> 80%)']].map(([color, label]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, opacity: 0.85 }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Heatmap({ sidebarOpen, setSidebarOpen }) {
  const [selectedZone, setSelectedZone] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Live Venue Heatmap" subtitle="Real-time crowd density across all zones" onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      <div className="page-body">
        <div className="grid-main-aside" style={{ alignItems: 'start' }}>
          {/* Map */}
          <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
            <div className="card-header">
              <span className="card-title">🗺️ NESCO Exhibition Centre</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                <Wifi size={13} /> Live Feed
              </div>
            </div>
            <div style={{ height: 520, margin: '12px 16px 16px' }}>
              <MapContainer
                center={[19.0765, 72.8773]}
                zoom={16}
                style={{ height: '100%', width: '100%', borderRadius: 10 }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {ZONES.map(zone => {
                  const pct = getZoneDensity(zone.id);
                  const color = getDensityColor(pct);
                  const radius = 20 + (pct / 100) * 30;
                  return (
                    <CircleMarker
                      key={zone.id}
                      center={[zone.lat, zone.lng]}
                      radius={radius}
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.45,
                        weight: 2,
                      }}
                      eventHandlers={{ click: () => setSelectedZone(zone) }}
                    >
                      <Popup>
                        <div style={{ minWidth: 180 }}>
                          <strong style={{ fontSize: '0.9rem' }}>{zone.name}</strong>
                          <div style={{ marginTop: 6, fontSize: '0.82rem', color: '#475569' }}>
                            Density: <strong style={{ color }}>{pct}%</strong><br />
                            Occupancy: {Math.round(zone.capacity * pct / 100)} / {zone.capacity}<br />
                            Status: <strong>{getDensityLevel(pct).toUpperCase()}</strong>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
            <MapLegend />
          </div>

          {/* Side Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Selected Zone Detail */}
            {selectedZone && (() => {
              const pct = getZoneDensity(selectedZone.id);
              const level = getDensityLevel(pct);
              const color = getDensityColor(pct);
              return (
                <div className="card fade-in">
                  <div className="card-header">
                    <span className="card-title">Zone Detail</span>
                    <button onClick={() => setSelectedZone(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)' }}>✕</button>
                  </div>
                  <div className="card-body">
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <div style={{ fontSize: '3rem', fontWeight: 900, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{pct}%</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, fontSize: '1.1rem' }}>{selectedZone.name}</div>
                      <span className={`badge-status ${level}`} style={{ marginTop: 8, display: 'inline-flex' }}>{level}</span>
                    </div>
                    <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 14px', marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Occupancy</span>
                        <span style={{ fontWeight: 700 }}>{Math.round(selectedZone.capacity * pct / 100)} / {selectedZone.capacity}</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* All Zones List */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">All Zones</span>
              </div>
              <div className="card-body" style={{ paddingTop: 10 }}>
                {ZONES.map(zone => {
                  const pct = getZoneDensity(zone.id);
                  const level = getDensityLevel(pct);
                  const color = getDensityColor(pct);
                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4, border: '1px solid var(--border)', background: selectedZone?.id === zone.id ? 'var(--primary-light)' : 'var(--bg)', transition: 'all 0.2s' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{zone.name}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
