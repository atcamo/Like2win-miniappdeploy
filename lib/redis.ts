import { Redis } from "@upstash/redis";

// Validate Redis configuration
function isValidRedisConfig() {
  const url = process.env.REDIS_URL;
  const token = process.env.REDIS_TOKEN;
  
  // Check if values exist and are not temporary placeholders
  if (!url || !token || url === 'temp_redis' || token === 'temp_token') {
    return false;
  }
  
  // Check if URL is a valid Redis URL
  return url.startsWith('redis://') || url.startsWith('rediss://');
}

if (!isValidRedisConfig()) {
  console.warn(
    "REDIS_URL or REDIS_TOKEN not properly configured. Redis features disabled. Set proper Upstash Redis credentials for full functionality.",
  );
}

export const redis = isValidRedisConfig()
  ? new Redis({
      url: process.env.REDIS_URL!,
      token: process.env.REDIS_TOKEN!,
    })
  : null;
