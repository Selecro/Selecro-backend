// src/middleware/logger.middleware.ts
import {Middleware} from '@loopback/rest';
import {httpRequestCounter, httpRequestDurationSeconds, logErrorToCrashlytics} from '.';

export const loggerMiddleware: Middleware = async (ctx, next) => {
  const start = process.hrtime.bigint(); // Use high-resolution time for better precision
  const {request, response} = ctx;

  // console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`); // Removed verbose console log

  // Skip rate limiting for Swagger and OpenAPI spec (this logic seems misplaced here,
  // it should be in rateLimitMiddleware. Keeping it as per your original code for now.)
  if (request.path.startsWith('/explorer') || request.path === '/openapi.json') {
    return next();
  }

  try {
    await next(); // Proceed to the next middleware or controller
  } catch (err) {
    // Log errors to Crashlytics/Error Reporting
    logErrorToCrashlytics(err, {
      method: request.method,
      url: request.url,
      ip: request.headers['x-forwarded-for']?.toString().split(',')[0].trim() || request.socket.remoteAddress,
    });
    console.error(`Error handling ${request.method} ${request.url}:`, err);
    throw err; // Re-throw the error so it can be handled by LoopBack's error handler
  } finally {
    const end = process.hrtime.bigint();
    const durationNs = end - start;
    const durationSeconds = Number(durationNs) / 1_000_000_000;

    // Record metrics for Prometheus
    httpRequestCounter.labels(request.method, request.url, response.statusCode.toString()).inc();
    httpRequestDurationSeconds.labels(request.method, request.url, response.statusCode.toString()).observe(durationSeconds);

    console.log(`[${response.statusCode}] ${request.method} ${request.url} - ${durationSeconds.toFixed(3)}s`);
  }
};
