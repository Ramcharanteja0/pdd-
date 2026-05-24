/**
 * supabaseService.js
 * Reusable helpers for all Supabase DB operations in CrowdIQ
 */
import { supabase } from './supabase';

// ── INCIDENTS ──────────────────────────────────────────────
export async function fetchIncidents() {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createIncident({ title, zone, type, description, severity = 'medium' }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('incidents')
    .insert([{ title, zone, type, description, severity, reported_by: user?.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function resolveIncident(id) {
  const { data, error } = await supabase
    .from('incidents')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── ALERTS ─────────────────────────────────────────────────
export async function fetchAlerts() {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function resolveAlert(id) {
  const { data, error } = await supabase
    .from('alerts')
    .update({ resolved: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── STAFF ──────────────────────────────────────────────────
export async function fetchStaff() {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function logDispatch({ staffId, message }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('dispatch_log')
    .insert([{ staff_id: staffId, message, sent_by: user?.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchDispatchLog() {
  const { data, error } = await supabase
    .from('dispatch_log')
    .select('*, staff:staff_id(name, role)')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

// ── ZONES ──────────────────────────────────────────────────
export async function fetchZones() {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .order('id');
  if (error) throw error;
  return data;
}

export async function updateZoneDensity(id, density) {
  const { data, error } = await supabase
    .from('zones')
    .update({ density })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── VENDORS ────────────────────────────────────────────────
export async function fetchVendors() {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('id');
  if (error) throw error;
  return data;
}

// ── PREDICTIONS ────────────────────────────────────────────
export async function fetchPredictions() {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ── AUTOMATED ACTIONS ──────────────────────────────────────
export async function fetchAutomatedActions() {
  const { data, error } = await supabase
    .from('automated_actions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function logAutomatedAction({ zone, title, description, triggered_by = 'system' }) {
  const { data, error } = await supabase
    .from('automated_actions')
    .insert([{ zone, title, description, triggered_by }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── ATTENDEE TRACKING (Real GPS) ──────────────────────────
export async function upsertAttendeeLocation({ deviceId, latitude, longitude, accuracy, zoneId, zoneName }) {
  const { data: existing } = await supabase
    .from('attendee_locations')
    .select('id')
    .eq('device_id', deviceId)
    .eq('event_id', 'current')
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('attendee_locations')
      .update({
        latitude, longitude, accuracy,
        zone_id: zoneId, zone_name: zoneName,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('attendee_locations')
      .insert([{
        device_id: deviceId, latitude, longitude, accuracy,
        zone_id: zoneId, zone_name: zoneName, event_id: 'current'
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function fetchAttendeeLocations() {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('attendee_locations')
    .select('*')
    .gte('updated_at', tenMinAgo)
    .eq('event_id', 'current');
  if (error) throw error;
  return data;
}

export async function countAttendeesByZone() {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('attendee_locations')
    .select('zone_id, zone_name')
    .gte('updated_at', tenMinAgo)
    .eq('event_id', 'current');
  if (error) throw error;

  const counts = {};
  (data || []).forEach(row => {
    const key = row.zone_id || 'unknown';
    if (!counts[key]) counts[key] = { zone_id: row.zone_id, zone_name: row.zone_name, count: 0 };
    counts[key].count++;
  });
  return Object.values(counts);
}

export async function removeAttendeeLocation(deviceId) {
  const { error } = await supabase
    .from('attendee_locations')
    .delete()
    .eq('device_id', deviceId)
    .eq('event_id', 'current');
  if (error) throw error;
}

// ── GATE SCANS ────────────────────────────────────────────
export async function createGateScan({ gateName, scanType, ticketId }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('gate_scans')
    .insert([{ gate_name: gateName, scan_type: scanType, ticket_id: ticketId, scanned_by: user?.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchGateScans() {
  const { data, error } = await supabase
    .from('gate_scans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
}

export async function getGateScanCounts() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('gate_scans')
    .select('scan_type, gate_name')
    .gte('created_at', today.toISOString());
  if (error) throw error;

  const entries = (data || []).filter(s => s.scan_type === 'entry').length;
  const exits = (data || []).filter(s => s.scan_type === 'exit').length;
  return { entries, exits, inside: entries - exits };
}
