import http from 'node:http';

function request({ method = 'GET', host, port, path, headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const opts = { method, host, port, path, headers };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const email = process.env.SMOKE_EMAIL || 'teacher1@pediafor.com';
  const password = process.env.SMOKE_PASSWORD || 'password';

  // Login at user-service to get token
  const login = await request({
    method: 'POST',
    host: 'localhost',
    port: 4000,
    path: '/auth/login',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginJson = JSON.parse(login.body);
  if (!loginJson?.accessToken) {
    console.error('Login failed at user-service:', login);
    process.exit(1);
  }
  const token = loginJson.accessToken;

  // Call gateway /api/auth/me
  const me = await request({
    method: 'GET',
    host: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Gateway /api/auth/me status:', me.status);
  console.log(me.body);
  process.exit(me.status >= 200 && me.status < 300 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
