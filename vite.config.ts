import { createHmac } from 'node:crypto'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const PRICE_INR = 499

// Mirrors netlify/functions/*.ts so the Razorpay flow is testable under plain
// `vite dev` without installing netlify-cli. Netlify's own build ignores this
// plugin and runs the real functions in netlify/functions/ instead.
function razorpayDevFunctions(env: Record<string, string>): Plugin {
  return {
    name: 'razorpay-dev-functions',
    configureServer(server) {
      server.middlewares.use('/.netlify/functions/create-order', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        const keyId = env.RAZORPAY_KEY_ID
        const keySecret = env.RAZORPAY_KEY_SECRET
        res.setHeader('Content-Type', 'application/json')
        if (!keyId || !keySecret) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Razorpay keys not configured' }))
          return
        }

        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: PRICE_INR * 100, currency: 'INR', receipt: `order_${Date.now()}` }),
        })

        if (!response.ok) {
          const detail = await response.text()
          res.statusCode = 502
          res.end(JSON.stringify({ error: 'Razorpay order creation failed', detail }))
          return
        }

        const order = (await response.json()) as { id: string; amount: number; currency: string }
        res.statusCode = 200
        res.end(JSON.stringify({ orderId: order.id, amount: order.amount, currency: order.currency, keyId }))
      })

      server.middlewares.use('/.netlify/functions/verify-payment', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        const keySecret = env.RAZORPAY_KEY_SECRET
        res.setHeader('Content-Type', 'application/json')
        if (!keySecret) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Razorpay keys not configured' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          try {
            const { orderId, paymentId, signature } = JSON.parse(body || '{}')
            if (!orderId || !paymentId || !signature) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Missing orderId, paymentId, or signature' }))
              return
            }
            const expected = createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex')
            if (expected !== signature) {
              res.statusCode = 400
              res.end(JSON.stringify({ unlocked: false, error: 'Signature mismatch' }))
              return
            }
            res.statusCode = 200
            res.end(JSON.stringify({ unlocked: true }))
          } catch {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid request body' }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), razorpayDevFunctions(env)],
  }
})
