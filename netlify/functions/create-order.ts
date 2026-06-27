import type { Handler } from '@netlify/functions'

const PRICE_INR = 99

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Razorpay keys not configured' }) }
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: PRICE_INR * 100,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    return { statusCode: 502, body: JSON.stringify({ error: 'Razorpay order creation failed', detail: errorBody }) }
  }

  const order = (await response.json()) as { id: string; amount: number; currency: string }

  return {
    statusCode: 200,
    body: JSON.stringify({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    }),
  }
}
