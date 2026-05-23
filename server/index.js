import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { randomUUID } from 'crypto';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// ─── In-memory stores ────────────────────────────────────────────────
const users = [
  { id: '1', name: 'Demo Organizer', email: 'demo@crowdiq.ai', password: 'demo1234', org: 'CrowdIQ Demo', role: 'Event Organizer' }
];
const incidents = [];
const alertLog = [];

// ─── Zone state ──────────────────────────────────────────────────────
const ZONES = [
  { id: 'Z1', name: 'Main Stage',      capacity: 2000, density: 94 },
  { id: 'Z2', name: 'North Entrance',  capacity: 800,  density: 68 },
  { id: 'Z3', name: 'Food Court A',    capacity: 600,  density: 89 },
  { id: 'Z4', name: 'Tech Expo Hall',  capacity: 1200, density: 62 },
  { id: 'Z5', name: 'Workshop Zone',   capacity: 400,  density: 28 },
  { id: 'Z6', name: 'South Exit',      capacity: 600,  density: 18 },
  { id: 'Z7', name: 'VIP Lounge',      capacity: 300,  density: 35 },
  { id: 'Z8', name: 'Parking A',       capacity: 500,  density: 22 },
  { id: 'Z9', name: 'First Aid',       capacity: 100,  density: 12 },
  { id: 'Z10', name: 'Media Centre',   capacity: 200,  density: 55 },
  { id: 'Z11', name: 'Food Court B',   capacity: 600,  density: 64 },
  { id: 'Z12', name: 'Emergency Gate', capacity: 400,  density: 15 },
];

let liveCrowd = 6247;

function getDensityLevel(pct) {
  if (pct >= 80) return 'critical';
  if (pct >= 55) return 'moderate';
  return 'safe';
}

// Simulate live crowd fluctuations
function simulateTick() {
  liveCrowd = Math.max(4000, liveCrowd + Math.floor(Math.random() * 30) - 12);
  ZONES.forEach(z => {
    z.density = Math.min(100, Math.max(5, z.density + Math.floor(Math.random() * 6) - 2));
    const level = getDensityLevel(z.density);
    if (level === 'critical' && Math.random() < 0.1) {
      const alert = {
        id: randomUUID(), type: 'danger', zone: z.name,
        title: 'Critical Density Alert',
        desc: `${z.name} reached ${z.density}% capacity — action required`,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        resolved: false
      };
      alertLog.unshift(alert);
      io.emit('new_alert', alert);
    }
  });
  io.emit('crowd_update', { liveCrowd, zones: ZONES.map(z => ({ id: z.id, density: z.density, level: getDensityLevel(z.density) })) });
}

setInterval(simulateTick, 4000);

// ─── REST API Routes ─────────────────────────────────────────────────

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString(), crowdIQ: 'v1.0.0' }));

// Auth — Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, org, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered.' });
  const user = { id: randomUUID(), name, email, password, org: org || '', role: role || 'Event Organizer' };
  users.push(user);
  const { password: _, ...safe } = user;
  res.status(201).json({ user: safe, message: 'Account created successfully.' });
});

// Auth — Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
  const { password: _, ...safe } = user;
  res.json({ user: safe, token: `tok_${randomUUID()}`, message: 'Login successful.' });
});

// Live crowd data
app.get('/api/crowd/live', (_, res) => {
  res.json({
    liveCrowd,
    zones: ZONES.map(z => ({ ...z, level: getDensityLevel(z.density), occupancy: Math.round(z.capacity * z.density / 100) })),
    timestamp: new Date().toISOString()
  });
});

// Alerts
app.get('/api/alerts', (_, res) => res.json(alertLog.slice(0, 20)));
app.patch('/api/alerts/:id/resolve', (req, res) => {
  const alert = alertLog.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found.' });
  alert.resolved = true;
  io.emit('alert_resolved', { id: alert.id });
  res.json({ message: 'Alert resolved.', alert });
});

// Incidents
app.get('/api/incidents', (_, res) => res.json(incidents));
app.post('/api/incidents', (req, res) => {
  const { zone, type, desc, reporter } = req.body;
  if (!zone || !desc) return res.status(400).json({ error: 'Zone and description are required.' });
  const incident = {
    id: randomUUID(),
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    zone, type: type || 'General', desc, reporter: reporter || 'Dashboard',
    status: 'Open', createdAt: new Date().toISOString()
  };
  incidents.unshift(incident);
  io.emit('new_incident', incident);
  res.status(201).json(incident);
});
app.patch('/api/incidents/:id/resolve', (req, res) => {
  const inc = incidents.find(i => i.id === req.params.id);
  if (!inc) return res.status(404).json({ error: 'Incident not found.' });
  inc.status = 'Resolved';
  io.emit('incident_resolved', { id: inc.id });
  res.json({ message: 'Incident resolved.', incident: inc });
});

// Staff dispatch
app.post('/api/staff/dispatch', (req, res) => {
  const { staffId, message, zone } = req.body;
  if (!staffId || !message) return res.status(400).json({ error: 'staffId and message are required.' });
  const dispatch = { id: randomUUID(), staffId, message, zone, timestamp: new Date().toISOString() };
  io.emit('staff_dispatch', dispatch);
  res.json({ message: 'Task dispatched.', dispatch });
});

// Zone stats
app.get('/api/zones', (_, res) => {
  res.json(ZONES.map(z => ({ ...z, level: getDensityLevel(z.density), occupancy: Math.round(z.capacity * z.density / 100) })));
});

// ─── Socket.IO ────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  // Send initial state on connect
  socket.emit('crowd_update', { liveCrowd, zones: ZONES.map(z => ({ id: z.id, density: z.density, level: getDensityLevel(z.density) })) });

  socket.on('staff_report', (data) => {
    console.log('[Socket] Staff report:', data);
    io.emit('staff_report_broadcast', { ...data, timestamp: new Date().toISOString() });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ─── Start ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 CrowdIQ Backend running on http://localhost:${PORT}`);
  console.log(`   REST API : http://localhost:${PORT}/api/health`);
  console.log(`   Socket.IO: ws://localhost:${PORT}`);
  console.log(`   Simulating live crowd data every 4 seconds...\n`);
});
