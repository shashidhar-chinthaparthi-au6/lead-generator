import { api } from './client.js';

export async function getCountries() {
  return api('/locations/countries');
}

export async function getStates(country = 'India') {
  return api(`/locations/states?country=${encodeURIComponent(country)}`);
}

export async function getCities(country = 'India', state) {
  if (!state) return [];
  return api(`/locations/cities?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`);
}
