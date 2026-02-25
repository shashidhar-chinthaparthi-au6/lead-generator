import { api } from './client.js';

export function leadsQuery(params = {}) {
  const q = new URLSearchParams(params).toString();
  return api(`/leads${q ? `?${q}` : ''}`);
}

export function leadByIdQuery(id) {
  return api(`/leads/${id}`);
}

export function sourcesQuery() {
  return api('/leads/sources');
}

export function createLead(body) {
  return api('/leads', { method: 'POST', body });
}

export function updateLead(id, body) {
  return api(`/leads/${id}`, { method: 'PATCH', body });
}

export function addActivity(leadId, { type, note }) {
  return api(`/leads/${leadId}/activities`, { method: 'POST', body: { type, note } });
}

export function runScrape(body) {
  return api('/scrape', { method: 'POST', body });
}

export function removeLegacyLeads() {
  return api('/leads/legacy', { method: 'DELETE' });
}
