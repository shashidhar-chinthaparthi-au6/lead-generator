export async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...(options.body && typeof options.body === 'object' && !(options.body instanceof FormData)
      ? { body: JSON.stringify(options.body) }
      : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

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

export async function getStates(country = 'India') {
  return api(`/locations/states?country=${encodeURIComponent(country)}`);
}

export async function getCities(country = 'India', state) {
  if (!state) return [];
  return api(`/locations/cities?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`);
}

export function getDepartments() {
  return api('/departments');
}

export function getQuotaStatus() {
  return api('/scrape/quota');
}
