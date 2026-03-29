import { ConfigService } from './services/ConfigService';

// Legacy constants — kept for backward compatibility in client-side code
// Server-side code should use ConfigService.getSessionPrice() instead
export const DEFAULT_SESSION_PRICE_EUR = 40;
export const DEFAULT_SESSION_CURRENCY = 'EUR';

// Server-side config-driven pricing
export async function getSessionPrice(): Promise<number> {
  return ConfigService.getSessionPrice();
}

export async function getSessionCurrency(): Promise<string> {
  return ConfigService.getSessionCurrency();
}
