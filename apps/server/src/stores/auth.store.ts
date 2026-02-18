import redisClient from "#src/config/redis.config.ts";

const REFRESH_TOKEN_PREFIX = "refresh_token:";
const BLACKLIST_PREFIX = "blacklist:";
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const buildKey = (token: string): string => {
  return `${REFRESH_TOKEN_PREFIX}${token}`;
};

const buildBlacklistKey = (jti: string) => `${BLACKLIST_PREFIX}${jti}`;

export const saveRefreshToken = async (token: string, userId: string) => {
  await redisClient.set(
    buildKey(token),
    userId,
    "EX",
    REFRESH_TOKEN_TTL_SECONDS,
  );
};

export const isRefreshTokenValid = async (token: string) => {
  const value = await redisClient.get(buildKey(token));
  return value !== null;
};

export const deleteRefreshToken = async (token: string) => {
  await redisClient.del(buildKey(token));
};

export const deleteAllUserTokens = async (userId: string) => {
  const stream = redisClient.scanStream({
    match: `${REFRESH_TOKEN_PREFIX}*`,
    count: 100,
  });

  const pipeline = redisClient.pipeline();
  let deleteCount = 0;

  stream.on("data", async (keys: string[]) => {
    for (const key of keys) {
      const storedUserId = await redisClient.get(key);
      if (storedUserId === userId) {
        pipeline.del(key);
        deleteCount++;
      }
    }
  });

  await new Promise<void>((resolve, reject) => {
    stream.on("end", async () => {
      if (deleteCount > 0) await pipeline.exec();
      resolve();
    });
    stream.on("error", reject);
  });
};

export const getTokenTTL = async (token: string) => {
  return await redisClient.ttl(buildKey(token));
};

export const blackListAccessToken = async (
  jti: string,
  expiresInSeconds: number,
) => {
  await redisClient.set(
    buildBlacklistKey(jti),
    "revoked",
    "EX",
    expiresInSeconds,
  );
};

export const isAccessTokenBlacklisted = async (jti: string) => {
  const value = await redisClient.get(buildBlacklistKey(jti));
  return value !== null;
};
