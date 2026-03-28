import crypto from 'crypto';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

const getStripeSecretKey = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe is not configured.');
  }
  return secretKey;
};

const getStripeWebhookSecret = () => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret is not configured.');
  }
  return webhookSecret;
};

const stripeRequest = async <T>(path: string, body: URLSearchParams): Promise<T> => {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Stripe request failed');
  }

  return payload as T;
};

interface StripeCheckoutSession {
  id: string;
  url: string;
  payment_status: string;
  status: string;
}

export async function createStripeCheckoutSession(input: {
  amountCents: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  description: string;
  metadata: Record<string, string>;
}) {
  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('success_url', input.successUrl);
  body.set('cancel_url', input.cancelUrl);
  body.set('customer_email', input.customerEmail);
  body.set('payment_method_types[0]', 'card');
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', input.currency.toLowerCase());
  body.set('line_items[0][price_data][unit_amount]', input.amountCents.toString());
  body.set('line_items[0][price_data][product_data][name]', input.description);

  Object.entries(input.metadata).forEach(([key, value]) => {
    body.set(`metadata[${key}]`, value);
  });

  return stripeRequest<StripeCheckoutSession>('/checkout/sessions', body);
}

export function verifyStripeWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined) {
  if (!signatureHeader) {
    throw new Error('Missing Stripe signature.');
  }

  const timestamp = signatureHeader
    .split(',')
    .find((component) => component.startsWith('t='))
    ?.split('=')[1];
  const signature = signatureHeader
    .split(',')
    .find((component) => component.startsWith('v1='))
    ?.split('=')[1];

  if (!timestamp || !signature) {
    throw new Error('Invalid Stripe signature.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', getStripeWebhookSecret())
    .update(`${timestamp}.${rawBody.toString('utf8')}`)
    .digest('hex');

  const provided = Buffer.from(signature, 'utf8');
  const expected = Buffer.from(expectedSignature, 'utf8');

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error('Stripe signature verification failed.');
  }

  return JSON.parse(rawBody.toString('utf8'));
}
