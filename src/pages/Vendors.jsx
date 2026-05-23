import { useState } from 'react';
import { ShoppingBag, TrendingUp, Clock, Star, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Topbar from '../components/Topbar';
import { VENDORS } from '../data/mockData';

const STATUS_CONFIG = {
  critical: { label: 'Overloaded', bg: '#FEE2E2', color: '#991B1B' },
  moderate: { label: 'Busy', bg: '#FEF3C7', color: '#92400E' },
  safe: { label: 'Normal', bg: '#D1FAE5', color: '#065F46' },
};

const revenueData = VENDORS.map(v => ({ name: v.name.split(' ')[0], revenue: Math.round(v.revenue / 1000), visits: v.visits }));

export default function Vendors({ sidebarOpen, setSidebarOpen }) {
  const [selected, setSelected] = useState(null);

  const totalRevenue = VENDORS.reduce((s, v) => s + v.revenue, 0);
  const totalVisits = VENDORS.reduce((s, v) => s + v.visits, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Vendor Analytics" subtitle="Live footfall, revenue & performance insights" onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      <div className="page-body">

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
          <div className="stat-card indigo">
            <div className="stat-icon indigo"><ShoppingBag size={20} /></div>
            <div className="stat-value">{VENDORS.length}</div>
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
          {VENDORS.map(v => {
            const sc = STATUS_CONFIG[v.status];
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
                    { icon: Users, label: 'Visits', val: v.visits.toLocaleString() },
                    { icon: TrendingUp, label: 'Revenue', val: `₹${(v.revenue/1000).toFixed(0)}K` },
                    { icon: Clock, label: 'Wait', val: v.waitTime },
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
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{v.rating}</span>
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
