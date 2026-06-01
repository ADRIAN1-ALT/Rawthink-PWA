import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../server';

let appPromise: Promise<any> | null = null;

export default async function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  if (!appPromise) appPromise = createApp();
  const app = await appPromise;
  // Express app is a function (req, res) compatible with Node's IncomingMessage/ServerResponse
  return app(req as any, res as any);
}
