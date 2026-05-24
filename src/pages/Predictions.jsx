import { useState, useEffect, useCallback } from 'react';
import { Zap, TrendingUp, AlertTriangle, CheckCircle, ShieldAlert, Terminal, Sparkles } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Topbar from '../components/Topbar';
import { fetchPredictions, fetchAutomatedActions, logAutomatedAction } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';

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
  const [predictions, setPredictions] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState([]);
  const [actingId, setActingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [preds, acts] = await Promise.all([
        fetchPredictions(),
        fetchAutomatedActions()
      ]);
      setPredictions(preds);
      setActions(acts);
    } catch (err) {
      console.error('Error loading AI Predictions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // ── Supabase Realtime Channels for Live Dispersion Auditing ──
    const actionsChannel = supabase
      .channel('live-dispersion-actions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'automated_actions' }, (payload) => {
        setActions(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(actionsChannel);
    };
  }, [loadData]);

  const handleAct = async (pred) => {
    setActingId(pred.id);
    try {
      await logAutomatedAction({
        zone: pred.zone,
        title: 'Manual AI Overriding Dispatch',
        description: `Operator triggered dispersion: '${pred.action}'`,
        triggered_by: 'operator_override'
      });
      setDismissed(prev => [...prev, pred.id]);
    } catch (err) {
      console.error('Error executing dispatch action:', err);
    } finally {
      setActingId(null);
    }
  };

  const filteredPredictions = predictions.filter(p => !dismissed.includes(p.id));

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar title="AI Predictions" subtitle="Loading AI models..." onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
          <div className="spinner" style={{ border: '4px solid rgba(99,102,241,0.1)', borderLeft: '4px solid var(--primary)', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="AI Predictions" subtitle="Predictive crowd intelligence — 92% average confidence" onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      <div className="page-body">

        {/* AI Banner */}
        <div style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #A78BFA)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 24, color: 'white', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>CrowdIQ AI Engine — Live</h2>
            <p style={{ opacity: 0.9, fontSize: '0.88rem' }}>Monitoring live telemetry. Summing crowd density parameters dynamically. Auto dispersion logs automatically trigger and audit on safety thresholds.</p>
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

        <div className="grid-main-aside" style={{ alignItems: 'start' }}>
          {/* Action Recommendations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card-header" style={{ paddingLeft: 0, paddingTop: 0 }}>
              <span className="card-title" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color="var(--primary)" /> AI Recommendations
              </span>
            </div>
            
            {filteredPredictions.length === 0 ? (
              <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle size={32} style={{ color: 'var(--success)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '0.85rem' }}>All crowd conditions are safe. No recommendations needed.</p>
              </div>
            ) : (
              filteredPredictions.map((p) => {
                const rc = RISK_CONFIG[p.risk] || RISK_CONFIG['LOW'];
                return (
                  <div key={p.id} className="card slide-in" style={{ borderLeft: `4px solid ${rc.color}` }}>
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
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => handleAct(p)}
                            disabled={actingId === p.id}
                          >
                            <CheckCircle size={13} /> {actingId === p.id ? 'Acting...' : 'Act'}
                          </button>
                          <button 
                            className="btn btn-sm btn-outline" 
                            onClick={() => setDismissed(prev => [...prev, p.id])}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Real-time System Audit Logs (Dispersion) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card-header" style={{ paddingLeft: 0, paddingTop: 0 }}>
              <span className="card-title" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Terminal size={16} /> Automated Dispersion Log
              </span>
            </div>

            <div className="card" style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#1E293B', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, fontFamily: 'monospace' }}>[SYSTEM CROWDIQ AUDIT]</span>
                <span style={{ display: 'inline-block', width: 8, height: 8, background: '#10B981', borderRadius: '50%' }} />
              </div>
              <div style={{ padding: 14, maxHeight: 380, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', color: '#E2E8F0', minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {actions.length === 0 ? (
                  <div style={{ color: '#64748B', textAlign: 'center', padding: '30px 0' }}>
                    &gt; Listening on public.automated_actions...<br />
                    &gt; Waiting for crowd thresholds to exceed capacity...
                  </div>
                ) : (
                  actions.map((act, idx) => {
                    const timeStr = new Date(act.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    const isManual = act.triggered_by === 'operator_override';
                    return (
                      <div key={act.id || idx} style={{ borderBottom: '1px solid #1E293B', paddingBottom: 8 }}>
                        <span style={{ color: '#6366F1' }}>[{timeStr}]</span>{' '}
                        <span style={{ color: isManual ? '#F59E0B' : '#EF4444', fontWeight: 700 }}>
                          [{isManual ? 'MANUAL OVERRIDE' : 'AUTO_DISPATCH'}]
                        </span>{' '}
                        on Zone <strong style={{ color: '#10B981' }}>{act.zone}</strong>:
                        <div style={{ paddingLeft: 12, marginTop: 4, color: '#94A3B8' }}>
                          - Title: {act.title}<br />
                          - Log: {act.description}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
