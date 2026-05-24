import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, TrendingUp, Clock, Star, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Topbar from '../components/Topbar';
import { fetchVendors } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';

const STATUS_CONFIG = {
  critical: { label: 'Overloaded', bg: '#FEE2E2', color: '#991B1B' },
  moderate: { label: 'Busy', bg: '#FEF3C7', color: '#92400E' },
  safe: { label: 'Normal', bg: '#D1FAE5', color: '#065F46' },
};

export default function Vendors({ sidebarOpen, setSidebarOpen }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchVendors();
      setVendors(data);
    } catch (err) {
      console.error('Error loading vendors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // ── Supabase Realtime Channels for Live Vendor Analytics ──
    const vendorsChannel = supabase
      .channel('vendors-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setVendors(prev => prev.map(v => v.id === payload.new.id ? payload.new : v));
          setSelected(prev => prev && prev.id === payload.new.id ? payload.new : prev);
        } else if (payload.eventType === 'INSERT') {
          setVendors(prev => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(vendorsChannel);
    };
  }, [loadData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar title="Vendor Analytics" subtitle="Loading vendor statistics..." onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
          <div className="spinner" style={{ border: '4px solid rgba(99,102,241,0.1)', borderLeft: '4px solid var(--primary)', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  const revenueData = vendors.map(v => ({ 
    name: v.name.split(' ')[0], 
    revenue: Math.round((v.revenue || 0) / 1000), 
    visits: v.visits || 0 
  }));

  const totalRevenue = vendors.reduce((s, v) => s + (v.revenue || 0), 0);
  const totalVisits = vendors.reduce((s, v) => s + (v.visits || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Vendor Analytics" subtitle="Live footfall, revenue & performance insights" onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      <div className="page-body">

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
          <div className="stat-card indigo">
            <div className="stat-icon indigo"><ShoppingBag size={20} /></div>
            <div className="stat-value">{vendors.length}</div>
            <div className="stat-label">Active Vendors</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><Users size={20} /></div>
            <div className="stat-value">{totalVisits.toLocaleString()}</div>
            <div className="stat-label">Total Visits Today</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-icon amber"><TrendingUp size={20} /></div>
            <div className="stat-value">₹{(totalRevenue / 100000).toFixed(1)}L</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><span className="card-title">Revenue & Footfall by Vendor</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip formatter={(v, n) => [n === 'revenue' ? `₹${v}K` : v, n === 'revenue' ? 'Revenue' : 'Visits']} />
                <Bar dataKey="revenue" name="Revenue (₹K)" fill="#6366F1" radius={[4,4,0,0]} />
                <Bar dataKey="visits" name="Visits" fill="#10B981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Cards */}
        <div className="grid-2">
          {vendors.map(v => {
            const sc = STATUS_CONFIG[v.status] || STATUS_CONFIG['safe'];
            return (
              <div key={v.id} className="vendor-card" onClick={() => setSelected(v)} style={{ cursor: 'pointer', borderLeft: `3px solid ${v.status === 'critical' ? '#EF4444' : v.status === 'moderate' ? '#F59E0B' : '#10B981'}`, background: selected?.id === v.id ? '#F5F3FF' : 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{v.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>📍 {v.zone}</div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>{sc.label}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { icon: Users, label: 'Visits', val: (v.visits || 0).toLocaleString() },
                    { icon: TrendingUp, label: 'Revenue', val: `₹${((v.revenue || 0)/1000).toFixed(0)}K` },
                    { icon: Clock, label: 'Wait', val: v.wait_time || '0 min' },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '8px 6px', background: 'var(--bg)', borderRadius: 8 }}>
                      <Icon size={14} color="var(--text-muted)" style={{ marginBottom: 3 }} />
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{val}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
                  <Star size={13} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{v.rating || 0.0}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {v.status === 'critical' ? '⚠️ Recommend opening overflow counter' : v.status === 'moderate' ? '📊 Monitor queue length' : '✅ Operating smoothly'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
