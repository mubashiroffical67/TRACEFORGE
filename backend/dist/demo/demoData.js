"use strict";
/**
 * Demo repository files for INC-0042 — Payment checkout failure
 * This simulates a real e-commerce checkout system with an intentional bug.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_INCIDENT = exports.DEMO_REPO_FILES = void 0;
exports.DEMO_REPO_FILES = {
    'src/services/paymentService.ts': `import { PaymentGateway } from '../integrations/paymentGateway';
import { Order } from '../models/Order';
import { logger } from '../utils/logger';

export interface PaymentRequest {
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod; // BUG: optional but never validated
}

export interface PaymentMethod {
  type: 'card' | 'paypal' | 'bank_transfer';
  token: string;
  last4?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export class PaymentService {
  private gateway: PaymentGateway;

  constructor(gateway: PaymentGateway) {
    this.gateway = gateway;
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    logger.info(\`Processing payment for order \${request.orderId}\`);

    // BUG: paymentMethod is never validated before use
    // This causes a runtime TypeError when paymentMethod is undefined
    const chargePayload = {
      amount: request.amount,
      currency: request.currency,
      token: request.paymentMethod.token,  // CRASH: TypeError if paymentMethod is undefined
      type: request.paymentMethod.type,
    };

    try {
      const result = await this.gateway.charge(chargePayload);
      logger.info(\`Payment successful: \${result.transactionId}\`);
      return { success: true, transactionId: result.transactionId };
    } catch (error) {
      logger.error(\`Payment failed: \${error}\`);
      return { success: false, error: String(error) };
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    try {
      await this.gateway.refund(transactionId, amount);
      return true;
    } catch (error) {
      logger.error(\`Refund failed: \${error}\`);
      return false;
    }
  }
}
`,
    'src/controllers/checkoutController.ts': `import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { OrderService } from '../services/orderService';
import { CartService } from '../services/cartService';
import { logger } from '../utils/logger';

export class CheckoutController {
  constructor(
    private paymentService: PaymentService,
    private orderService: OrderService,
    private cartService: CartService
  ) {}

  async processCheckout(req: Request, res: Response): Promise<void> {
    const { customerId, cartId, paymentDetails } = req.body;

    try {
      // Get cart
      const cart = await this.cartService.getCart(cartId);
      if (!cart) {
        res.status(404).json({ error: 'Cart not found' });
        return;
      }

      // Create order
      const order = await this.orderService.createOrder({
        customerId,
        items: cart.items,
        total: cart.total,
      });

      // Process payment — paymentMethod may be undefined if client omits it
      const paymentResult = await this.paymentService.processPayment({
        orderId: order.id,
        customerId,
        amount: cart.total,
        currency: 'USD',
        paymentMethod: paymentDetails?.paymentMethod, // may be undefined
      });

      if (!paymentResult.success) {
        await this.orderService.cancelOrder(order.id);
        res.status(402).json({ error: 'Payment failed', details: paymentResult.error });
        return;
      }

      await this.orderService.confirmOrder(order.id, paymentResult.transactionId!);
      res.json({ success: true, orderId: order.id, transactionId: paymentResult.transactionId });

    } catch (error) {
      logger.error('Checkout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
`,
    'src/services/orderService.ts': `import { Order, OrderStatus } from '../models/Order';
import { OrderRepository } from '../repositories/orderRepository';

export class OrderService {
  constructor(private repo: OrderRepository) {}

  async createOrder(data: { customerId: string; items: any[]; total: number }): Promise<Order> {
    return this.repo.create({
      customerId: data.customerId,
      items: data.items,
      total: data.total,
      status: 'PENDING',
    });
  }

  async confirmOrder(orderId: string, transactionId: string): Promise<Order> {
    return this.repo.update(orderId, {
      status: 'CONFIRMED',
      transactionId,
      confirmedAt: new Date(),
    });
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return this.repo.update(orderId, { status: 'CANCELLED' });
  }
}
`,
    'src/utils/validator.ts': `// Input validation utilities

export function validatePaymentRequest(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.orderId) errors.push('orderId is required');
  if (!data.customerId) errors.push('customerId is required');
  if (!data.amount || data.amount <= 0) errors.push('amount must be positive');
  if (!data.currency) errors.push('currency is required');
  // NOTE: paymentMethod validation is missing here

  return { valid: errors.length === 0, errors };
}
`,
    'tests/paymentService.test.ts': `import { PaymentService } from '../src/services/paymentService';
import { MockPaymentGateway } from './mocks/mockPaymentGateway';

describe('PaymentService', () => {
  let service: PaymentService;
  let mockGateway: MockPaymentGateway;

  beforeEach(() => {
    mockGateway = new MockPaymentGateway();
    service = new PaymentService(mockGateway);
  });

  it('should process a valid payment', async () => {
    mockGateway.mockSuccess('txn_123');
    const result = await service.processPayment({
      orderId: 'order_1',
      customerId: 'cust_1',
      amount: 99.99,
      currency: 'USD',
      paymentMethod: { type: 'card', token: 'tok_test', last4: '4242' },
    });
    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('txn_123');
  });

  it('should handle gateway failure', async () => {
    mockGateway.mockFailure('Card declined');
    const result = await service.processPayment({
      orderId: 'order_2',
      customerId: 'cust_1',
      amount: 50.00,
      currency: 'USD',
      paymentMethod: { type: 'card', token: 'tok_declined', last4: '0000' },
    });
    expect(result.success).toBe(false);
  });

  // MISSING: test for undefined paymentMethod — this is the gap that led to INC-0042
});
`,
};
exports.DEMO_INCIDENT = {
    incidentId: 'INC-0042',
    title: 'Payment checkout failure — customers receiving 500 errors',
    description: 'Customers are intermittently receiving a 500 Internal Server Error during the checkout process. The issue appears to affect approximately 12% of checkout attempts. Customer support has received 47 complaints in the last hour. Revenue impact estimated at $3,200/hour.',
    severity: 'CRITICAL',
    errorMessage: "TypeError: Cannot read properties of undefined (reading 'token')\n    at PaymentService.processPayment",
    stackTrace: `TypeError: Cannot read properties of undefined (reading 'token')
    at PaymentService.processPayment (src/services/paymentService.ts:42:38)
    at CheckoutController.processCheckout (src/controllers/checkoutController.ts:38:35)
    at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)
    at next (node_modules/express/lib/router/route.js:144:13)
    at Route.dispatch (node_modules/express/lib/router/route.js:114:3)
    at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)
    at node_modules/express/lib/router/index.js:284:15
    at Function.process_params (node_modules/express/lib/router/index.js:346:12)
    at next (node_modules/express/lib/router/index.js:280:10)
    at checkout (src/routes/checkout.ts:12:5)`,
    logs: `[2024-01-15 08:41:23] INFO  Processing payment for order ord_9f3a2b1c
[2024-01-15 08:41:23] ERROR Payment failed: TypeError: Cannot read properties of undefined (reading 'token')
[2024-01-15 08:41:23] ERROR Checkout error: TypeError: Cannot read properties of undefined (reading 'token')
[2024-01-15 08:41:45] INFO  Processing payment for order ord_8e2d1a0b
[2024-01-15 08:41:45] ERROR Payment failed: TypeError: Cannot read properties of undefined (reading 'token')
[2024-01-15 08:42:01] INFO  Processing payment for order ord_7c1e9f8d
[2024-01-15 08:42:01] INFO  Payment successful: txn_4521abc (paymentMethod provided)
[2024-01-15 08:42:15] ERROR Payment failed: TypeError: Cannot read properties of undefined (reading 'token')
[2024-01-15 08:42:30] INFO  Checkout error rate: 12.3% over last 15 minutes`,
    affectedService: 'checkout-api',
    expectedBehavior: 'Checkout should complete successfully and return a transaction ID. Customers should receive an order confirmation.',
    actualBehavior: 'Checkout fails with a 500 Internal Server Error for approximately 12% of requests. Investigation shows these requests have an undefined paymentMethod in the request payload.',
    isDemo: true,
};
//# sourceMappingURL=demoData.js.map