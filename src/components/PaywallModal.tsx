import { useState } from 'react'
import type { RazorpaySuccessResponse } from '../razorpay'

interface PaywallModalProps {
  projectTitle: string
  onClose: () => void
  onUnlocked: () => void
}

const PRICE_DISPLAY = '₹99'

export function PaywallModal({ projectTitle, onClose, onUnlocked }: PaywallModalProps) {
  const [status, setStatus] = useState<'idle' | 'creating-order' | 'verifying' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handlePay() {
    setStatus('creating-order')
    setErrorMessage('')
    try {
      const orderResponse = await fetch('/.netlify/functions/create-order', { method: 'POST' })
      if (!orderResponse.ok) throw new Error('Could not start checkout. Please try again.')
      const order = (await orderResponse.json()) as {
        orderId: string
        amount: number
        currency: string
        keyId: string
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Landing Page Generator',
        description: `Unlock download: ${projectTitle}`,
        handler: (response: RazorpaySuccessResponse) => {
          void verifyPayment(response)
        },
        modal: {
          ondismiss: () => setStatus('idle'),
        },
      })
      razorpay.open()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  async function verifyPayment(response: RazorpaySuccessResponse) {
    setStatus('verifying')
    try {
      const verifyResponse = await fetch('/.netlify/functions/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        }),
      })
      const result = (await verifyResponse.json()) as { unlocked: boolean }
      if (verifyResponse.ok && result.unlocked) {
        onUnlocked()
      } else {
        setStatus('error')
        setErrorMessage('Payment could not be verified. If you were charged, contact support.')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Payment verification failed. If you were charged, contact support.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Unlock download</h2>
        <p className="text-sm text-slate-600 mb-4">
          Get the full React project for <span className="font-medium">{projectTitle}</span>.
        </p>
        <div className="text-3xl font-bold text-slate-900 mb-6">{PRICE_DISPLAY}</div>

        {status === 'error' && <p className="text-sm text-red-600 mb-4">{errorMessage}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={status === 'creating-order' || status === 'verifying'}
            className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold"
          >
            {status === 'creating-order' && 'Starting…'}
            {status === 'verifying' && 'Verifying…'}
            {(status === 'idle' || status === 'error') && 'Pay with Razorpay'}
          </button>
        </div>
      </div>
    </div>
  )
}
