import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const email = 'test' + Date.now() + '@example.com';
  console.log('Testing registration for', email);
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email,
        country: 'Peru',
        password: 'Password123!',
      }),
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
