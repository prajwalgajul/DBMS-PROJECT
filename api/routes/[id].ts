import { getRouteById } from '../../lib/store';
import { config, sendJson } from '../_shared';

export { config };

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { message: 'Method not allowed' });
    return;
  }

  const routeId = req.query?.id;
  const route = typeof routeId === 'string' ? getRouteById(routeId) : null;

  sendJson(res, route ? 200 : 404, route || { message: 'Route not found' });
}
