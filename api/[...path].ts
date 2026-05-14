import {
  addRoute,
  cancelBooking,
  createBooking,
  getBookings,
  getRouteById,
  getRoutes,
} from '../lib/store';

function sendJson(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function readBody(req: any) {
  return new Promise<any>((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk: Buffer | string) => {
      raw += chunk.toString();
    });

    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

export default async function handler(req: any, res: any) {
  const method = req.method || 'GET';
  const pathSegments = Array.isArray(req.query?.path)
    ? req.query.path
    : req.query?.path
      ? [req.query.path]
      : [];
  const routePath = `/${pathSegments.join('/')}`;

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (method === 'GET' && routePath === '/routes') {
    sendJson(res, 200, getRoutes());
    return;
  }

  if (method === 'GET' && pathSegments[0] === 'routes' && pathSegments[1]) {
    const route = getRouteById(pathSegments[1]);
    sendJson(res, route ? 200 : 404, route || { message: 'Route not found' });
    return;
  }

  if (method === 'POST' && routePath === '/routes') {
    const body = await readBody(req);
    sendJson(res, 201, addRoute(body));
    return;
  }

  if (method === 'GET' && routePath === '/bookings') {
    sendJson(res, 200, getBookings());
    return;
  }

  if (method === 'POST' && routePath === '/bookings') {
    const body = await readBody(req);
    const result = createBooking(body);
    sendJson(res, result.status, result.body);
    return;
  }

  if (method === 'DELETE' && pathSegments[0] === 'bookings' && pathSegments[1]) {
    const result = cancelBooking(pathSegments[1]);
    sendJson(res, result.status, result.body);
    return;
  }

  sendJson(res, 404, { message: 'Not found' });
}
