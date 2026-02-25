import { api } from './client.js';

export function getDepartments() {
  return api('/departments');
}
