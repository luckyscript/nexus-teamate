import { Provide, Scope, ScopeEnum, Inject } from '@midwayjs/core';
import { RedisService } from './redis.service';

@Provide()
@Scope(ScopeEnum.Singleton)
export class DistributedLockService {
  @Inject()
  redisService: RedisService;

  private readonly DEFAULT_TTL = 30;

  async acquire(
    key: string,
    value: string,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<boolean> {
    const client = this.redisService.getClient();
    const result = await client.set(key, value, 'EX', ttl, 'NX');
    return result === 'OK';
  }

  async release(key: string, value: string): Promise<boolean> {
    const client = this.redisService.getClient();
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await client.eval(script, 1, key, value);
    return (result as number) === 1;
  }

  async extend(key: string, value: string, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    const client = this.redisService.getClient();
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("expire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;
    const result = await client.eval(script, 1, key, value, String(ttl));
    return (result as number) === 1;
  }

  async withLock<T>(
    key: string,
    ttl: number,
    action: () => Promise<T>,
    retryTimes: number = 3,
    retryDelay: number = 100,
  ): Promise<T> {
    const lockValue = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    for (let i = 0; i < retryTimes; i++) {
      const acquired = await this.acquire(key, lockValue, ttl);
      if (acquired) {
        try {
          return await action();
        } finally {
          await this.release(key, lockValue);
        }
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    throw new Error(`Failed to acquire lock: ${key}`);
  }
}
