'use client';

import { useState } from 'react';

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processPayment = async ({
    planKey,
    billingCycle,
    user,
    onSuccess,
    onError,
  }: {
    planKey: string;
    billingCycle: 'monthly' | 'yearly';
    user: { name?: string | null; email?: string | null };
    onSuccess: (account?: any) => void;
    onError: (err: string) => void;
  }) => {
    setLoading(true);
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      onError('Payment system failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      const orderRes = await fetch('/api/payment/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey, billingCycle }),
      });

      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sendrix',
        description: `${planKey.toUpperCase()} Plan - ${billingCycle}`,
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                planKey,
                billingCycle,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              onSuccess(verifyData.account);
            } else {
              throw new Error(verifyData.error || 'Verification failed');
            }
          } catch (err: any) {
            onError(err.message);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#04342C',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        onError(response.error.description);
      });
      paymentObject.open();
    } catch (err: any) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { processPayment, loading };
};
