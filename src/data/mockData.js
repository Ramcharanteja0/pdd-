// Reusable utilities and metadata for CrowdIQ platform

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

// Reusable live density calculations
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
