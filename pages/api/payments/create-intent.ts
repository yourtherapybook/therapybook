import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { authenticateUser } from '../../../lib/auth-middleware';
import { z } from 'zod';

const paymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('EUR'),
  sessionId: z.string().cuid().optional(),
  description: z.string().optional(),
  paymentMethod: z.enum(['stripe', 'paypal']).default('stripe'),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticateUser(req, res);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validatedData = paymentIntentSchema.parse(req.body);
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        sessionId: validatedData.sessionId,
        amount: validatedData.amount,
        currency: validatedData.currency,
        status: 'PENDING',
        paymentMethod: validatedData.paymentMethod,
        description: validatedData.description || 'TherapyBook session payment',
      },
    });

    // In a real implementation, you would create a Stripe PaymentIntent here
    // For now, we'll return a mock response
    const mockPaymentIntent = {
      id: `pi_mock_${payment.id}`,
      client_secret: `pi_mock_${payment.id}_secret_${Math.random().toString(36).substring(7)}`,
      amount: validatedData.amount * 100, // Stripe uses cents
      currency: validatedData.currency.toLowerCase(),
      status: 'requires_payment_method',
    };

    // Update payment with external ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripePaymentId: mockPaymentIntent.id,
      },
    });

    res.status(201).json({ 
      payment,
      paymentIntent: mockPaymentIntent,
      message: 'Payment intent created successfully' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}