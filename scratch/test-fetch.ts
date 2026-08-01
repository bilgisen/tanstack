import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const token = process.env.POLAR_ACCESS_TOKEN;

async function testFetch() {
  console.log('Sending fetch request to Polar API...');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('https://api.polar.sh/v1/checkouts/custom/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        products: ['21cce3c0-6541-4e3d-81be-d8287e78eb0f'],
        external_customer_id: 'BQy4jFgJAxlLWk4Q4WSo6ZaCZqKRBOUa',
        customer_email: 'hbkarabey@gmail.com',
        customer_name: 'Hasan Basri Karabey',
        return_url: 'https://jetborsa.com/profil'
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    console.log('STATUS:', res.status, res.statusText);
    const text = await res.text();
    console.log('RESPONSE:', text);
  } catch (err: any) {
    clearTimeout(timeout);
    console.error('FETCH ERROR:', err);
  }
}

testFetch();
