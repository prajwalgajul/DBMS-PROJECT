import { cancelBooking } from '../../lib/store';
import { config, sendJson } from '../_shared';

export { config };

export default function handler(req: any, res: any) {
  if (req.method !== 'DELETE') {
    sendJson(res, 405, { message: 'Method not allowed' });
    return;
  }

  const bookingId = req.query?.id;
  const result = typeof bookingId === 'string'
    ? cancelBooking(bookingId)
    : { status: 400 as const, body: { message: 'Booking id is required' } };

  sendJson(res, result.status, result.body);
}
