// ==========================================================
// UniMart: Backend Test Script
// ==========================================================
import http from 'http';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING UNIMART BACKEND TESTS ---');

  // 1. Health check
  console.log('\n1. Checking /api/health...');
  const health = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log(`Status: ${health.status}`, health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Reject non-university domain
  console.log('\n2. Testing registration with non-university domain (should fail)...');
  const rejectTest = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'hacker@gmail.com',
    password: 'password123',
    full_name: 'Intruder',
    reg_id: 'UNKNOWN'
  });
  console.log(`Status: ${rejectTest.status} (Expected 400)`, rejectTest.data);
  if (rejectTest.status !== 400) throw new Error('Domain validation failed to reject invalid email!');

  // 3. Login with demo student account
  console.log('\n3. Testing login with demo account (kavindu.p@student.rjt.ac.lk)...');
  const loginRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'kavindu.p@student.rjt.ac.lk',
    password: 'Password123'
  });
  console.log(`Status: ${loginRes.status}`, loginRes.data?.user?.full_name);
  if (loginRes.status !== 200 || !loginRes.data.token) throw new Error('Login failed');
  const token = loginRes.data.token;

  // 4. Fetch categories
  console.log('\n4. Fetching categories...');
  const catRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/categories',
    method: 'GET'
  });
  console.log(`Found ${catRes.data.length} categories.`);

  // 5. Fetch listings
  console.log('\n5. Fetching listings (hardware & skills)...');
  const listRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/listings',
    method: 'GET'
  });
  console.log(`Found ${listRes.data.length} total listings.`);

  // 6. Filter by hardware
  const hwRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/listings?type=hardware',
    method: 'GET'
  });
  console.log(`Found ${hwRes.data.length} hardware listings.`);

  // 7. Create a new listing
  console.log('\n6. Creating a new hardware listing with authenticated token...');
  const createRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/listings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: 'Raspberry Pi Pico RP2040 Microcontroller Board',
    description: 'Dual-core ARM Cortex M0+ processor with pre-soldered pins. Ideal for embedded C and MicroPython coursework.',
    category_id: 1,
    item_type: 'hardware',
    price: 1800,
    price_type: 'fixed',
    condition: 'brand_new',
    location: 'FOT Electronics Lab 01',
    images: ['https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800']
  });
  console.log(`Status: ${createRes.status}`, createRes.data?.listing?.title);
  if (createRes.status !== 201) throw new Error('Create listing failed');

  console.log('\n✅ ALL BACKEND TESTS PASSED SUCCESSFULLY!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
