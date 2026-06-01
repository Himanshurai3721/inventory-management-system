export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let detail = 'Unknown error';
    try {
      const data = await response.json();
      if (typeof data.detail === 'string') {
        detail = data.detail;
      } else if (Array.isArray(data.detail)) {
        detail = data.detail.map((e) => e.msg || JSON.stringify(e)).join('; ');
      } else {
        detail = JSON.stringify(data.detail);
      }
    } catch {
      detail = response.statusText || 'Unknown error';
    }
    throw new Error(detail);
  }

  // 204 No Content — return null
  if (response.status === 204) return null;

  return response.json();
}
