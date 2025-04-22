"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWrapAsyncTemplate = generateWrapAsyncTemplate;
function generateWrapAsyncTemplate() {
    return `// src/utils/wrapAsync.ts
  import { Request, Response, NextFunction } from 'express';

  export const wrapAsync = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
    };
  };
  `;
}
