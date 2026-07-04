import dataResource from './resource.js';

export async function requestUnicorn(payload) {
  const url = `${dataResource.config.endpoint}/request`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default requestUnicorn;