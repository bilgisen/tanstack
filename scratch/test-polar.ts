import path from 'node:path';
import { Polar } from '@polar-sh/sdk';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('POLAR_ACCESS_TOKEN:', process.env.POLAR_ACCESS_TOKEN ? 'present (' + process.env.POLAR_ACCESS_TOKEN.substring(0, 15) + '...)' : 'missing');
console.log('POLAR_SERVER:', process.env.POLAR_SERVER);

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: (process.env.POLAR_SERVER as 'production' | 'sandbox') || 'production'
});

async function run() {
  try {
    const res = await polar.checkouts.create({
      products: ['21cce3c0-6541-4e3d-81be-d8287e78eb0f'],
      externalCustomerId: 'BQy4jFgJAxlLWk4Q4WSo6ZaCZqKRBOUa',
      customerEmail: 'hbkarabey@gmail.com',
      customerName: 'Hasan Basri Karabey',
      returnUrl: 'https://jetborsa.com/profil'
    });
    console.log('SUCCESS:', res.url);
  } catch (err: any) {
    console.error('ERROR NAME:', err?.name);
    console.error('ERROR MESSAGE:', err?.message);
    console.error('ERROR STATUS:', err?.status || err?.statusCode);
    if (err?.body) {
      console.error('ERROR BODY:', err.body);
    } else {
      console.error('ERROR FULL:', err);
    }
  }
}

run();
