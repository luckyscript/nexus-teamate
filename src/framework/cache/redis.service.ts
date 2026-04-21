import { Injectable, Scope, ScopeEnum, Config, Init } from '@midwayjs/core';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
@Scope(ScopeEnum.Singleton)
export class RedisService {
  private client: Redis;

  @Config('redis')
  redisConfig: RedisOptions;

  @Init()
  async init() {
    this.client = new Redis({
      host: this.redisConfig?.host ?? '127.0.0.1',
      port: this.redisConfig?.port ?? 6379,
      password: this.redisConfig?.password,
      db: this.redisConfig?.db ?? 0,
      keyPrefix: this.redisConfig?.keyPrefix ?? 'nexus:',
      retryStrategy: times => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      ...this.redisConfig,
    });

    this.client.on('error', err => {
      console.error('Redis connection error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis connected');
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK' | null> {
    if (ttl) {
      return this.client.set(key, value, 'EX', ttl);
    }
    return this.client.set(key, value);
  }

  async setJSON(key: string, value: unknown, ttl?: number): Promise<'OK' | null> {
    return this.set(key, JSON.stringify(value), ttl);
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async expire(key: string, ttl: number): Promise<number> {
    return this.client.expire(key, ttl);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(key, field, value);
  }

  async hdel(key: string, field: string): Promise<number> {
    return this.client.hdel(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.client.srem(key, ...members);
  }

  async sismember(key: string, member: string): Promise<number> {
    return this.client.sismember(key, member);
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.client.zadd(key, score, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrange(key, start, stop);
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    return this.client.zrem(key, ...members);
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.client.lpush(key, ...values);
  }

  async rpop(key: string): Promise<string | null> {
    return this.client.rpop(key);
  }

  async llen(key: string): Promise<number> {
    return this.client.llen(key);
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  async subscribe(channel: string): Promise<void> {
    await this.client.subscribe(channel);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async scan(cursor: number, pattern?: string, count?: number): Promise<[string, string[]]> {
    const args: (string | number)[] = [cursor];
    if (pattern) args.push('MATCH', pattern);
    if (count) args.push('COUNT', count);
    return this.client.scan(...args.map(String) as [string]);
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }
}
