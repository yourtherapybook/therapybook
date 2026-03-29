import { prisma } from '../prisma';

// Fallback defaults (used when DB has no config yet)
const DEFAULTS: Record<string, string> = {
  'session.price': '40',
  'session.currency': 'EUR',
  'session.duration': '50',
  'platform.name': 'TherapyBook',
  'policy.cancellation_hours': '24',
  'policy.refund_type': 'FULL',
};

export class ConfigService {
  private static cache = new Map<string, { value: string; expiresAt: number }>();
  private static CACHE_TTL = 60_000; // 1 minute

  static async get(key: string): Promise<string> {
    // Check in-memory cache
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    try {
      const config = await prisma.platformConfig.findUnique({ where: { key } });
      const value = config?.value ?? DEFAULTS[key] ?? '';

      this.cache.set(key, { value, expiresAt: Date.now() + this.CACHE_TTL });
      return value;
    } catch {
      return DEFAULTS[key] ?? '';
    }
  }

  static async getNumber(key: string): Promise<number> {
    const value = await this.get(key);
    return Number(value) || 0;
  }

  static async set(key: string, value: string, label?: string): Promise<void> {
    await prisma.platformConfig.upsert({
      where: { key },
      create: { key, value, label },
      update: { value, label },
    });
    this.cache.set(key, { value, expiresAt: Date.now() + this.CACHE_TTL });
  }

  static async getSessionPrice(): Promise<number> {
    return this.getNumber('session.price');
  }

  static async getSessionCurrency(): Promise<string> {
    return this.get('session.currency');
  }

  static async getAll(): Promise<Record<string, string>> {
    try {
      const configs = await prisma.platformConfig.findMany();
      const result: Record<string, string> = { ...DEFAULTS };
      for (const config of configs) {
        result[config.key] = config.value;
      }
      return result;
    } catch {
      return { ...DEFAULTS };
    }
  }
}
