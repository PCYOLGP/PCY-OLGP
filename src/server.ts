import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context.mjs';

/**
 * Initialize the Angular App Engine.
 * In Angular 19+, this automatically handles SSR using the configuration from the build.
 */
const angularAppEngine = new AngularAppEngine();

/**
 * Netlify-compatible request handler for Angular SSR.
 * This handler is used by Netlify Edge Functions to process incoming requests.
 */
export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const context = getContext();

  /**
   * Custom API routes can be defined here.
   * NOTE: Node.js specific libraries (like 'fs-extra', 'multer', or 'express')
   * are not compatible with Netlify Edge Functions.
   * If you need a persistent database or file uploads, consider using
   * Netlify Functions (Node.js) or a managed database/storage service.
   */
  const url = new URL(request.url);

  // Forward API routes to PHP backend
  if (url.pathname.startsWith('/api/')) {
    const phpUrl = new URL(url.pathname.replace(/^\/api/, ''), 'http://localhost/PCY-WEBDOC/php-backend/');
    // Append query parameters
    url.searchParams.forEach((value, key) => phpUrl.searchParams.append(key, value));

    try {
      const response = await fetch(phpUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' ? await request.clone().blob() : null,
      });
      return response;
    } catch (err) {
      console.error('Error proxying to PHP:', err);
      return new Response(JSON.stringify({ error: 'Failed to reach PHP backend', details: err }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  const result = await angularAppEngine.handle(request, context);
  return result || new Response('Not found', { status: 404 });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build)
 * and Netlify's deployment runtime.
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
