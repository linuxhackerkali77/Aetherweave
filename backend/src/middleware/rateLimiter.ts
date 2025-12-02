import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

// General API rate limiter
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// AI endpoints rate limiter (more restrictive)
const aiRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1,
    });
  }
};

export const aiRateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await aiRateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many AI requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1,
    });
  }
};