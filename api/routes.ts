import { addRoute, getRoutes } from '../lib/store';
import { config, getJsonBody, sendJson } from './_shared';

export { config };

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    sendJson(res, 200, getRoutes());
    return;
  }

  if (req.method === 'POST') {
    const newRoute = addRoute(getJsonBody(req));
    sendJson(res, 201, newRoute);
    return;
  }

  sendJson(res, 405, { message: 'Method not allowed' });
}
