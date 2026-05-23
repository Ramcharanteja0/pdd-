import { BarChart2, TrendingUp, Users, Clock, Award, Download } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Topbar from '../components/Topbar';
import { CROWD_TIMELINE, STAFF } from '../data/mockData';

const peakData = [
  { hour: '09:00', crowd: 320 }, { hour: '10:00', crowd: 1800 }, { hour: '11:00', crowd: 4100 },
  { hour: '12:00', crowd: 6100 }, { hour: '13:00', crowd: 5900 }, { hour: '14:00', crowd: 5600 }, { hour: 'Now', crowd: 6247 },
];

const zoneShare = [
  { name: 'Main Stage', value: 30, color: '#6366F1' },
  { name: 'Tech Expo', value: 25, color: '#8B5CF6' },
  { name: 'Food Courts', value: 22, color: '#F59E0B' },
  { name: 'Entrance', value: 13, color: '#10B981' },
  { name: 'Others', value: 10, color: '#94A3B8' },
];

const staffPerf = [
  { name: 'Security', tasks: 47, resolved: 44 },
  { name: 'Medical', tasks: 18, resolved: 18 },
  { name: 'Volunteer', tasks: 62, resolved: 55 },
  { name: 'Cleaner', tasks: 30, resolved: 29 },
  { name: 'Supervisor', tasks: 24, resolved: 22 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow)' }}>
        <p style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color, fontSize: '0.78rem' }}>{p.name}: {p.value?.toLocaleString()}</p>)}
      </div>
    );
  }
  return null;
};

export default function Analytics({ sidebarOpen, setSidebarOpen }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Analytics & Reports" subtitle="Post-event insights and performance metrics" onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      <div className="page-body">

        {/* KPIs */}
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Peak Attendance', value: '6,800', change: '+12% vs last event', color: 'indigo', icon: Users },
            { label: 'Avg Response Time', value: '3.2 min', change: '-22% improved', color: 'green', icon: Clock },
            { label: 'Incidents Resolved', value: '97%', change: '35/36 resolved', color: 'blue', icon: Award },
            { label: 'Staff Efficiency', value: '91%', change: 'Top quartile', color: 'amber', icon: TrendingUp },
          ].map(({ label, value, change, color, icon: Icon }) => (
            <div key={label} className={`stat-card ${color}`}>
              <div className={`stat-icon ${color}`}><Icon size={20} /></div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
              <span className="stat-change up" style={{ marginTop: 6 }}>{change}</span>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Full Day Timeline */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Attendance Timeline</span>
              <button className="btn btn-sm btn-outline"><Download size={12} /> Export</button>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={peakData} margin={{ left: -20, top: 5 }}>
                  <defs>
                    <linearGradient id="gAtd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="crowd" name="Attendees" stroke="#6366F1" strokeWidth={2.5} fill="url(#gAtd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Zone Share Pie */}
          <div className="card">
            <div className="card-header"><span className="card-title">Zone Distribution</span></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={zoneShare} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {zoneShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '0.75rem' }} />
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <span className="card-title">Staff Performance by Role</span>
            <button className="btn btn-sm btn-outline"><Download size={12} /> Report</button>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={staffPerf} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip />
                <Bar dataKey="tasks" name="Tasks Assigned" fill="#C7D2FE" radius={[4,4,0,0]} />
                <Bar dataKey="resolved" name="Tasks Resolved" fill="#6366F1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="card">
          <div className="card-header"><span className="card-title">Safety Compliance Summary</span></div>
          <div className="card-body">
            <div className="grid-3">
              {[
                { label: 'Max Capacity Breaches', value: '2', status: 'warning', note: 'Main Stage & Food Court A' },
                { label: 'Emergency Exits Clear', value: '100%', status: 'safe', note: 'All 6 exits monitored' },
                { label: 'Medical Response SLA', value: '98%', status: 'safe', note: 'Avg 2.1 min response' },
                { label: 'Staff Coverage Score', value: '94%', status: 'safe', note: '12/12 zones covered' },
                { label: 'Incident Documentation', value: '100%', status: 'safe', note: 'All incidents logged' },
                { label: 'AI Alert Accuracy', value: '91%', status: 'safe', note: 'False positives: 9%' },
              ].map(({ label, value, status, note }) => (
                <div key={label} style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.4rem', color: status === 'safe' ? 'var(--success)' : 'var(--warning)', fontFamily: 'var(--font-display)' }}>{value}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: 2 }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
