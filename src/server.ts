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

  // Example placeholder for API routes
  if (url.pathname.startsWith('/api/')) {
    // For now, we delegate to Angular or return a 404 if not handled by Angular Server Routes.
    // If you had custom express logic, it should be migrated to Netlify Functions.
  }

  const result = await angularAppEngine.handle(request, context);
  return result || new Response('Not found', { status: 404 });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build)
 * and Netlify's deployment runtime.
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
