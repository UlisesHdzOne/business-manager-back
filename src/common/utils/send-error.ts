import { Request, Response } from 'express';

export function sendError(
  request: Request,
  response: Response,
  status: number,
  message: string[],
) {
  return response.status(status).json({
    statusCode: status,
    message,
    path: request.url,
    timestamp: new Date().toISOString(),
  });
}
