import { RateLimiterMemory } from "rate-limiter-flexible";

export const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60, 
});

// Limite para CADASTRO — máx 3 cadastros por minuto por IP
export const registerLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60, // 1 minuto
});