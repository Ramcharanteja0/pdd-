import { useState } from 'react';
import { Zap, TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Topbar from '../components/Topbar';
import { PREDICTIONS, ZONES, getZoneDensity } from '../data/mockData';

const RISK_CONFIG = {
  HIGH: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  MEDIUM: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  LOW: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
};

const radarData = [
  { zone: 'Main Stage', density: 94 },
  { zone: 'Food Court A', density: 89 },
  { zone: 'N.Entrance', density: 68 },
  { zone: 'Tech Expo', density: 62 },
  { zone: 'Food Court B', density: 64 },
  { zone: 'Media Ctr', density: 55 },
];

const forecastData = [
  { time: 'Now',   mainStage: 94, foodA: 89, entrance: 68 },
  { time: '+15m',  mainStage: 97, foodA: 91, entrance: 72 },
  { time: '+30m',  mainStage: 88, foodA: 76, entrance: 80 },
  { time: '+45m',  mainStage: 71, foodA: 64, entrance: 65 },
  { time: '+60m',  mainStage: 55, foodA: 48, entrance: 40 },
  { time: '+90m',  mainStage: 42, foodA: 35, entrance: 28 },
];

export default function Predictions({ sidebarOpen, setSidebarOpen }) {
  const [dismissed, setDismissed] = useState([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="AI Predictions" subtitle="Predictive crowd intelligence — 87% average confidence" onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      <div className="page-body">

        {/* AI Banner */}
        <div style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #A78BFA)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 24, color: 'white', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>CrowdIQ AI Engine — Active</h2>
            <p style={{ opacity: 0.85, fontSize: '0.88rem' }}>Analyzing crowd patterns across 12 zones. Next crowd spike predicted in 18 minutes at Main Stage. Recommend pre-deploying 3 staff to south corridor.</p>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1 }}>92%</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Confidence</div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Radar Chart */}
          <div className="card">
            <div className="card-header"><span className="card-title">Zone Risk Radar</span></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="zone" tick={{ fontSize: 11, fill: '#475569' }} />
                  <Radar name="Density %" dataKey="density" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="card">
            <div className="card-header"><span className="card-title">60-Min Density Forecast</span></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={forecastData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="mainStage" name="Main Stage" fill="#EF4444" radius={[4,4,0,0]} />
                  <Bar dataKey="foodA" name="Food Court A" fill="#F59E0B" radius={[4,4,0,0]} />
                  <Bar dataKey="entrance" name="N.Entrance" fill="#6366F1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Prediction Cards */}
        <div className="card-header" style={{ marginBottom: 16, paddingLeft: 0 }}>
          <span className="card-title" style={{ fontSize: '1rem' }}>Action Recommendations</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PREDICTIONS.filter((_, i) => !dismissed.includes(i)).map((p, i) => {
            const rc = RISK_CONFIG[p.risk];
            return (
              <div key={i} className="card slide-in" style={{ borderLeft: `4px solid ${rc.color}` }}>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.5px' }}>{p.risk} RISK</span>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{p.zone}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Confidence: <strong style={{ color: 'var(--primary)' }}>{p.confidence}%</strong></span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                        <TrendingUp size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle', color: rc.color }} />
                        {p.prediction}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#EEF2FF', borderRadius: 8 }}>
                        <Zap size={14} color="#6366F1" />
                        <span style={{ fontSize: '0.82rem', color: '#4F46E5', fontWeight: 600 }}>Recommended: {p.action}</span>
                      </div>
                      <div style={{ marginTop: 10, height: 6, background: '#E0E7FF', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${p.confidence}%`, height: '100%', background: 'linear-gradient(90deg, #6366F1, #818CF8)', borderRadius: 99, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button className="btn btn-sm btn-primary"><CheckCircle size={13} /> Act</button>
                      <button className="btn btn-sm btn-outline" onClick={() => setDismissed(prev => [...prev, i])}>Dismiss</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
