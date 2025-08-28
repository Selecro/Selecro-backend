// src/utils/monitoring.ts
import client from 'prom-client';

// --- Prometheus Metrics Setup ---
// Create a Registry to register metrics
export const register = new client.Registry();

// Add a default metrics collection (Node.js process metrics)
client.collectDefaultMetrics({register});

// Define a Counter for total requests
export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

// Define a Histogram for request duration
export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // Buckets for duration
  registers: [register],
});

// --- Error Reporting (Firebase Crashlytics / Google Cloud Error Reporting) ---
// This is a placeholder function. In a real application, you would
// initialize Firebase Admin SDK and use a service like Google Cloud Error Reporting
// or a dedicated error tracking tool (e.g., Sentry, Bugsnag) here.
// Firebase Crashlytics is primarily for mobile app crashes.
export function logErrorToCrashlytics(error: any, requestDetails: {method: string; url: string; ip?: string}) {
  console.error('--- ERROR REPORTING (SIMULATED) ---');
  console.error('Error logged for Crashlytics/Error Reporting:', error);
  console.error('Request Details:', requestDetails);
  // Example of how you *might* send to a real service:
  // if (admin.apps.length) {
  //   admin.crashlytics().log(`Error for ${requestDetails.method} ${requestDetails.url}: ${error.message}`);
  //   admin.crashlytics().recordError(error);
  // }
  // For Google Cloud Error Reporting:
  // const {ErrorReporting} = require('@google-cloud/error-reporting');
  // const errors = new ErrorReporting();
  // errors.report(error);
  console.error('-----------------------------------');
}

// You would also need an endpoint to expose Prometheus metrics, e.g., in a controller:
// @get('/metrics', {
//   responses: {
//     '200': {
//       description: 'Prometheus metrics',
//       content: {'text/plain': {schema: {type: 'string'}}},
//     },
//   },
// })
// async getMetrics(): Promise<string> {
//   response.setHeader('Content-Type', register.contentType);
//   return register.metrics();
// }
