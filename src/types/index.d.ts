declare module './middleware/error.middleware' {
  import { Request, Response, NextFunction } from 'express';

  export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
  }

  export function errorHandler(
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void;
}

declare module './routes/auth.routes' {
  import { Router } from 'express';
  const router: Router;
  export default router;
}

declare module './routes/ocr.routes' {
  import { Router } from 'express';
  const router: Router;
  export default router;
}

declare module './middleware/auth.middleware' {
  import { Request, Response, NextFunction } from 'express';
  export function authenticateToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
} 