import type { Handler } from '@netlify/functions'
import { createHmac } from 'node:crypto'

interface VerifyBody {
  orderId: string
  paymentId: string
  signature: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Razorpay keys not configured' }) }
  }

  let payload: VerifyBody
  try {
    payload = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  const { orderId, paymentId, signature } = payload
  if (!orderId || !paymentId || !signature) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing orderId, paymentId, or signature' }) }
  }

  const expectedSignature = createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex')

  if (expectedSignature !== signature) {
    return { statusCode: 400, body: JSON.stringify({ unlocked: false, error: 'Signature mismatch' }) }
  }

  return { statusCode: 200, body: JSON.stringify({ unlocked: true }) }
}
