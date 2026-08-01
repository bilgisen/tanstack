import path from 'node:path';
import { Polar } from '@polar-sh/sdk';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Testing @polar-sh/sdk...');

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: (process.env.POLAR_SERVER as 'production' | 'sandbox') || 'production'
});

async function run() {
  console.log('Calling polar.checkouts.create...');
  const start = Date.now();
  try {
    const res = await polar.checkouts.create({
      products: ['21cce3c0-6541-4e3d-81be-d8287e78eb0f'],
      externalCustomerId: 'BQy4jFgJAxlLWk4Q4WSo6ZaCZqKRBOUa',
      customerEmail: 'hbkarabey@gmail.com',
      customerName: 'Hasan Basri Karabey',
      returnUrl: 'https://jetborsa.com/profil'
    });
    console.log(`Finished in ${Date.now() - start}ms:`, res.url);
  } catch (err: any) {
    console.error(`Failed in ${Date.now() - start}ms:`, err);
  }
}

run();
