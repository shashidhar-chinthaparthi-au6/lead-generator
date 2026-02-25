import { api } from './client.js';

export function getOfferings() {
  return api('/offerings');
}
