const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = isJson ? data?.error || 'Request failed' : 'Request failed';
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function getDashboard() {
  return request('/api/dashboard');
}

export async function listItems() {
  return request('/api/items');
}

export async function getItemHistory(itemId) {
  return request(`/api/items/${itemId}/history`);
}

export async function getBinCard(itemId, params) {
  return request(`/api/items/${itemId}/bin-card${toQuery(params)}`);
}

export async function createItem(payload) {
  return request('/api/items', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateItem(itemId, payload) {
  return request(`/api/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function logPurchase(payload) {
  return request('/api/purchases', { method: 'POST', body: JSON.stringify(payload) });
}

export async function issueItem(payload) {
  return request('/api/issuances', { method: 'POST', body: JSON.stringify(payload) });
}

export async function listEmployees() {
  return request('/api/employees');
}

export async function createEmployee(payload) {
  return request('/api/employees', { method: 'POST', body: JSON.stringify(payload) });
}

export async function listPurchases(params) {
  return request(`/api/purchases${toQuery(params)}`);
}

function toQuery(params) {
  const parts = [];
  for (const [k, v] of Object.entries(params || {})) {
    if (v === undefined || v === null || v === '') continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

export async function listIssuances(params) {
  return request(`/api/issuances${toQuery(params)}`);
}

export function exportUrl(kind) {
  return `${API_BASE}/api/export/${kind}`;
}
