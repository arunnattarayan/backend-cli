export function generateerrorHandlerTemplate(): string {
  return `
  import { Request, Response, NextFunction } from 'express';

  export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
    res.status(404).json({
      success: false,
      message: 'Route '+ req.originalUrl + 'not found',
    });
  }

  export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }`
}