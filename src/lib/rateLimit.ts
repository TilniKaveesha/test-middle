import { kv } from "@vercel/kv"; // Or your preferred KV store

export default async function rateLimit(
  identifier: string, 
  maxAttempts: number,
  timeWindowSeconds: number
): Promise<void> {
  const key = `rate-limit:${identifier}`;
  const current = await kv.get<number>(key);

  if (current && current >= maxAttempts) {
    throw new Error("Too many requests. Please try again later.");
  }

  await kv.set(key, (current || 0) + 1, {
    ex: timeWindowSeconds,
  });
}