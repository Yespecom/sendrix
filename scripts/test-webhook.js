
const crypto = require('crypto');

async function test() {
  const email = 'test-' + Date.now() + '@example.com';
  const name = 'Test User';
  const secret = 'sendrix_onboarding_secret_2024';
  const id = 'b68f71fa-982e-46fe-bc1a-cc4ad883c3eb';
  const url = `http://localhost:3000/api/webhook/${id}`;

  const payload = JSON.stringify({ email, name });
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  console.log('Testing Webhook:', url);
  console.log('Payload:', payload);
  console.log('Signature:', signature);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sendrix-signature': signature
      },
      body: payload
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch Error:', err.message);
  }
}

test();
