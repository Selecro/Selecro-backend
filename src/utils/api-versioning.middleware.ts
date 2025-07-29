// src/middleware/api-versioning.middleware.ts
import {Middleware} from '@loopback/rest';

// Environment variable for the API version header name
const API_VERSION_HEADER = process.env.API_VERSION_HEADER || 'X-API-Version';

export const apiVersioningMiddleware: Middleware = async (context, next) => {
  const {request} = context;
  let apiVersion: string | undefined;

  // 1. Check for version in a custom header
  if (request.headers[API_VERSION_HEADER.toLowerCase()]) {
    apiVersion = request.headers[API_VERSION_HEADER.toLowerCase()] as string;
  }
  // 2. Optional: Check for version in the URL path (e.g., /v1/resource)
  // This would require more complex routing logic or pre-processing
  // if (request.path.startsWith('/v')) {
  //   const pathParts = request.path.split('/');
  //   if (pathParts.length > 1 && pathParts[1].match(/^v\d+$/)) {
  //     apiVersion = pathParts[1];
  //   }
  // }

  if (apiVersion) {
    // You can attach the version to the request context for later use
    // For example, to be used by controllers to select different logic or models
    Object.assign(request, {apiVersion});
    console.log(`API Version detected: ${apiVersion} from header ${API_VERSION_HEADER}`);
  } else {
    console.log('No API Version detected.');
  }

  await next();
};
