import { createBooking, getBookings } from '../lib/store';
import { config, getJsonBody, sendJson } from './_shared';

export { config };

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    sendJson(res, 200, getBookings());
    return;
  }

  if (req.method === 'POST') {
    const result = createBooking(getJsonBody(req));
    sendJson(res, result.status, result.body);
    return;
  }

  sendJson(res, 405, { message: 'Method not allowed' });
}
