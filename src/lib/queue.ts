import type { RedisClientType } from "redis";
import type { AppConfig } from "../types.js";

export class Queue {
  constructor(
    private readonly redis: RedisClientType,
    private readonly config: AppConfig
  ) {}

  private ticketPendingKey(ticketKey: string): string {
    return `ticket:${ticketKey}:pending`;
  }

  private ticketLockKey(ticketKey: string): string {
    return `ticket:${ticketKey}:run-lock`;
  }

  private ticketInterruptKey(ticketKey: string): string {
    return `ticket:${ticketKey}:interrupt`;
  }

  private deliveryDedupeKey(deliveryId: string): string {
    return `delivery:${deliveryId}`;
  }

  async rememberDelivery(deliveryId: string): Promise<boolean> {
    const result = await this.redis.set(this.deliveryDedupeKey(deliveryId), "1", {
      NX: true,
      EX: 3600
    });
    return result === "OK";
  }

  async enqueueUpdate(ticketKey: string, updateId: number): Promise<void> {
    await this.redis.rPush(this.ticketPendingKey(ticketKey), String(updateId));
  }

  async acquireRunLock(ticketKey: string): Promise<boolean> {
    const result = await this.redis.set(this.ticketLockKey(ticketKey), this.config.workerId, {
      NX: true,
      EX: this.config.redisLockTtlSec
    });
    return result === "OK";
  }

  async releaseRunLock(ticketKey: string): Promise<void> {
    const key = this.ticketLockKey(ticketKey);
    const owner = await this.redis.get(key);
    if (owner === this.config.workerId) {
      await this.redis.del(key);
    }
  }

  async requestInterrupt(ticketKey: string): Promise<void> {
    await this.redis.set(this.ticketInterruptKey(ticketKey), "1", {
      EX: this.config.redisLockTtlSec
    });
  }

  async consumeInterrupt(ticketKey: string): Promise<boolean> {
    const key = this.ticketInterruptKey(ticketKey);
    const value = await this.redis.get(key);
    if (value) {
      await this.redis.del(key);
      return true;
    }
    return false;
  }
}
