export function sendJson(res: any, status: number, body: unknown) {
  res.status(status).json(body);
}

export function getJsonBody(req: any) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body || {};
}

export const config = {
  runtime: 'nodejs',
};
