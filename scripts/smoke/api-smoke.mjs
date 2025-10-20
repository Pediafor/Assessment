// Simple E2E API smoke test without relying on global fetch
// - POST /api/auth/login with seeded credentials
// - If success, GET /api/auth/me with Bearer token

import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

function request(method, urlStr, { headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + (url.search || ''),
      headers,
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', reject);

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function main() {
  const email = process.env.SMOKE_EMAIL || 'teacher1@pediafor.com';
  const password = process.env.SMOKE_PASSWORD || 'password';

  console.log(`Using API base: ${BASE_URL}`);
  console.log(`Attempting login as: ${email}`);

  try {
    let loginRes = await request('POST', `${BASE_URL}/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    let loginJson; try { loginJson = JSON.parse(loginRes.body); } catch { loginJson = { raw: loginRes.body }; }
    console.log('Login status:', loginRes.status);
    console.log('Login response:', loginJson);

    // Fallback: some older gateway builds may rewrite '/api/auth' to '' instead of '/auth'
    if ((loginRes.status === 404 || loginRes.status === 400) && (loginJson?.path === '/login' || loginJson?.error)) {
      console.log('Retrying login with compatibility path ...');
      loginRes = await request('POST', `${BASE_URL}/auth/auth/login`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      try { loginJson = JSON.parse(loginRes.body); } catch { loginJson = { raw: loginRes.body }; }
      console.log('Compat login status:', loginRes.status);
      console.log('Compat login response:', loginJson);
    }

    if (loginRes.status < 200 || loginRes.status >= 300 || !loginJson?.accessToken) {
      throw new Error(`Login failed or missing accessToken (status ${loginRes.status})`);
    }

    const accessToken = loginJson.accessToken;

    const meRes = await request('GET', `${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    let meJson; try { meJson = JSON.parse(meRes.body); } catch { meJson = { raw: meRes.body }; }
    console.log('ME status:', meRes.status);
    console.log('ME response:', meJson);
    if (meRes.status < 200 || meRes.status >= 300) {
      throw new Error(`Fetching /auth/me failed with status ${meRes.status}`);
    }

    console.log('\nSmoke test PASSED');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test FAILED:', err?.message || err);
    process.exit(1);
  }
}

main();
