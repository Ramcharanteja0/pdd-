// Live simulation data store for CrowdIQ platform

export const EVENT_INFO = {
  name: "Tech Summit 2026",
  venue: "NESCO Exhibition Centre",
  city: "Mumbai, India",
  date: "May 13, 2026",
  startTime: "09:00 AM",
  endTime: "08:00 PM",
  totalCapacity: 8000,
  zones: 12,
  staffDeployed: 84,
};

export const ZONES = [
  { id: "Z1", name: "Main Stage",      capacity: 2000, lat: 19.0765, lng: 72.8773, color: "#EF4444" },
  { id: "Z2", name: "North Entrance",  capacity: 800,  lat: 19.0780, lng: 72.8768, color: "#F59E0B" },
  { id: "Z3", name: "Food Court A",    capacity: 600,  lat: 19.0758, lng: 72.8780, color: "#EF4444" },
  { id: "Z4", name: "Tech Expo Hall",  capacity: 1200, lat: 19.0760, lng: 72.8760, color: "#F59E0B" },
  { id: "Z5", name: "Workshop Zone",   capacity: 400,  lat: 19.0748, lng: 72.8775, color: "#10B981" },
  { id: "Z6", name: "South Exit",      capacity: 600,  lat: 19.0750, lng: 72.8763, color: "#10B981" },
  { id: "Z7", name: "VIP Lounge",      capacity: 300,  lat: 19.0770, lng: 72.8785, color: "#10B981" },
  { id: "Z8", name: "Parking A",       capacity: 500,  lat: 19.0785, lng: 72.8780, color: "#10B981" },
  { id: "Z9", name: "First Aid",       capacity: 100,  lat: 19.0755, lng: 72.8770, color: "#10B981" },
  { id: "Z10", name: "Media Centre",   capacity: 200,  lat: 19.0762, lng: 72.8790, color: "#F59E0B" },
  { id: "Z11", name: "Food Court B",   capacity: 600,  lat: 19.0742, lng: 72.8768, color: "#F59E0B" },
  { id: "Z12", name: "Emergency Gate", capacity: 400,  lat: 19.0775, lng: 72.8758, color: "#10B981" },
];

export const STAFF = [
  { id: "S01", name: "Rajan Mehta",    role: "Security",   zone: "North Entrance",  status: "active",   phone: "+91 98100 11111", avatar: "RM" },
  { id: "S02", name: "Priya Sharma",   role: "Medical",    zone: "First Aid",       status: "active",   phone: "+91 98100 22222", avatar: "PS" },
  { id: "S03", name: "Arjun Verma",    role: "Volunteer",  zone: "Main Stage",      status: "busy",     phone: "+91 98100 33333", avatar: "AV" },
  { id: "S04", name: "Kavita Singh",   role: "Cleaner",    zone: "Food Court A",    status: "active",   phone: "+91 98100 44444", avatar: "KS" },
  { id: "S05", name: "Dev Nair",       role: "Security",   zone: "South Exit",      status: "active",   phone: "+91 98100 55555", avatar: "DN" },
  { id: "S06", name: "Meena Joshi",    role: "Supervisor", zone: "Main Stage",      status: "active",   phone: "+91 98100 66666", avatar: "MJ" },
  { id: "S07", name: "Suresh Pillai",  role: "Security",   zone: "Tech Expo Hall",  status: "offline",  phone: "+91 98100 77777", avatar: "SP" },
  { id: "S08", name: "Anita Roy",      role: "Medical",    zone: "VIP Lounge",      status: "active",   phone: "+91 98100 88888", avatar: "AR" },
  { id: "S09", name: "Kiran Das",      role: "Volunteer",  zone: "Workshop Zone",   status: "busy",     phone: "+91 98100 99999", avatar: "KD" },
  { id: "S10", name: "Vijay Reddy",    role: "Security",   zone: "Parking A",       status: "active",   phone: "+91 98100 10101", avatar: "VR" },
];

export const ALERTS = [
  { id: "A1", type: "danger",  zone: "Main Stage",     title: "Critical Overcrowding",         desc: "Crowd density at 94% — immediate action required", time: "2 min ago",  resolved: false },
  { id: "A2", type: "danger",  zone: "Food Court A",   title: "Exit Blockage Detected",        desc: "South exit partially blocked, redirecting flow",   time: "5 min ago",  resolved: false },
  { id: "A3", type: "warning", zone: "North Entrance", title: "Queue Spike Forming",           desc: "Queue extended 40% beyond threshold",             time: "8 min ago",  resolved: false },
  { id: "A4", type: "warning", zone: "Tech Expo Hall", title: "Moderate Congestion",           desc: "Density at 68%, monitor closely",                 time: "11 min ago", resolved: false },
  { id: "A5", type: "info",    zone: "Workshop Zone",  title: "Staff Reassignment",            desc: "2 staff moved from Zone 5 to Main Stage",         time: "14 min ago", resolved: true  },
  { id: "A6", type: "success", zone: "South Exit",     title: "Flow Restored",                 desc: "Emergency exit clearance completed",              time: "20 min ago", resolved: true  },
  { id: "A7", type: "danger",  zone: "Food Court A",   title: "Medical Assistance Needed",     desc: "Staff reported fainting near stall 7",            time: "22 min ago", resolved: false },
  { id: "A8", type: "warning", zone: "Media Centre",   title: "Credential Verification Slow",  desc: "Media entry processing 3x slower than normal",   time: "30 min ago", resolved: false },
];

export const CROWD_TIMELINE = [
  { time: "09:00", attendees: 320,  stage: 280, foodA: 40,  expo: 0   },
  { time: "09:30", attendees: 890,  stage: 650, foodA: 120, expo: 120 },
  { time: "10:00", attendees: 1800, stage: 1100,foodA: 350, expo: 350 },
  { time: "10:30", attendees: 3200, stage: 2000,foodA: 600, expo: 600 },
  { time: "11:00", attendees: 4100, stage: 2400,foodA: 800, expo: 900 },
  { time: "11:30", attendees: 5200, stage: 2800,foodA: 900, expo: 1500},
  { time: "12:00", attendees: 6100, stage: 3000,foodA: 1200,expo: 1900},
  { time: "12:30", attendees: 6800, stage: 3100,foodA: 1400,expo: 2300},
  { time: "13:00", attendees: 5900, stage: 2700,foodA: 1600,expo: 1600},
  { time: "13:30", attendees: 5100, stage: 2300,foodA: 1200,expo: 1600},
  { time: "14:00", attendees: 5600, stage: 2800,foodA: 900, expo: 1900},
  { time: "Now",   attendees: 6247, stage: 1890,foodA: 980, expo: 3377},
];

export const VENDORS = [
  { id: "V1", name: "Chai Point",     zone: "Food Court A", visits: 1240, revenue: 62000, waitTime: "12 min", rating: 4.2, status: "critical" },
  { id: "V2", name: "Spice Garden",   zone: "Food Court B", visits: 890,  revenue: 44500, waitTime: "6 min",  rating: 4.5, status: "moderate" },
  { id: "V3", name: "TechGear Store", zone: "Tech Expo",    visits: 2100, revenue: 315000,waitTime: "3 min",  rating: 4.7, status: "safe"     },
  { id: "V4", name: "BookNook",       zone: "Workshop",     visits: 340,  revenue: 17000, waitTime: "1 min",  rating: 4.1, status: "safe"     },
  { id: "V5", name: "FreshJuice Hub", zone: "Food Court A", visits: 560,  revenue: 28000, waitTime: "8 min",  rating: 4.3, status: "moderate" },
  { id: "V6", name: "Merch Central",  zone: "Main Stage",   visits: 1780, revenue: 178000,waitTime: "5 min",  rating: 4.6, status: "moderate" },
];

export const INCIDENT_LOG = [
  { id: "I1", time: "13:42", zone: "Food Court A", type: "Medical",    desc: "Attendee reported dizziness",         reporter: "S04", status: "In Progress" },
  { id: "I2", time: "13:18", zone: "Main Stage",   type: "Security",   desc: "Unauthorized access attempt at VIP",  reporter: "S06", status: "Resolved"    },
  { id: "I3", time: "12:55", zone: "North Entrance",type: "Crowd",     desc: "Queue overflow — 40+ waiting outside", reporter: "S01", status: "Resolved"    },
  { id: "I4", time: "12:30", zone: "Tech Expo",    type: "Technical",  desc: "Display screen malfunction Stall 12", reporter: "S09", status: "Resolved"    },
  { id: "I5", time: "11:48", zone: "South Exit",   type: "Crowd",      desc: "Crowd surged after session end",      reporter: "S05", status: "Resolved"    },
];

export const PREDICTIONS = [
  { zone: "Main Stage",    risk: "HIGH",   prediction: "Exit rush likely in ~18 min after keynote ends", action: "Pre-deploy 3 staff to south corridor", confidence: 92 },
  { zone: "Food Court A",  risk: "HIGH",   prediction: "Queue will exceed 200 people in ~10 min",        action: "Open Food Court B overflow counter",   confidence: 87 },
  { zone: "North Entrance",risk: "MEDIUM", prediction: "Entry surge expected at 15:00 (workshop break)", action: "Activate lane 3 and lane 4",            confidence: 78 },
  { zone: "Tech Expo Hall",risk: "LOW",    prediction: "Density stable, slight increase post-2PM",       action: "Monitor but no immediate action needed",confidence: 85 },
];

// Simulate live density (0-100%)
export function getZoneDensity(zoneId) {
  const densities = { Z1: 94, Z2: 68, Z3: 89, Z4: 62, Z5: 28, Z6: 18, Z7: 35, Z8: 22, Z9: 12, Z10: 55, Z11: 64, Z12: 15 };
  return densities[zoneId] || 30;
}

export function getDensityLevel(pct) {
  if (pct >= 80) return "critical";
  if (pct >= 55) return "moderate";
  return "safe";
}

export function getDensityColor(pct) {
  if (pct >= 80) return "#EF4444";
  if (pct >= 55) return "#F59E0B";
  return "#10B981";
}
