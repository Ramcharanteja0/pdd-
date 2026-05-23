import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { ALERTS } from '../data/mockData';
import { getZoneDensity } from '../data/mockData';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [liveCrowd, setLiveCrowd] = useState(6247);
  const [zoneDensities, setZoneDensities] = useState({});
  const [liveAlerts, setLiveAlerts] = useState(ALERTS);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'], timeout: 5000 });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('[CrowdIQ] Connected to backend Socket.IO');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('[CrowdIQ] Disconnected from backend');
    });

    socket.on('connect_error', () => {
      setConnected(false);
      // Silently fall back to mock data when backend is not running
    });

    socket.on('crowd_update', (data) => {
      if (data.liveCrowd) setLiveCrowd(data.liveCrowd);
      if (data.zones) {
        const map = {};
        data.zones.forEach(z => { map[z.id] = z.density; });
        setZoneDensities(map);
      }
    });

    socket.on('new_alert', (alert) => {
      setLiveAlerts(prev => [alert, ...prev]);
    });

    socket.on('alert_resolved', ({ id }) => {
      setLiveAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, type: 'success' } : a));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const resolveAlert = async (alertId) => {
    try {
      await fetch(`${BACKEND_URL}/api/alerts/${alertId}/resolve`, { method: 'PATCH' });
    } catch {
      // Fallback: resolve locally if backend unreachable
      setLiveAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true, type: 'success' } : a));
    }
  };

  const dispatchStaff = (staffId, message, zone) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('staff_dispatch', { staffId, message, zone, timestamp: new Date().toISOString() });
    }
  };

  return { connected, liveCrowd, zoneDensities, liveAlerts, resolveAlert, dispatchStaff };
}
