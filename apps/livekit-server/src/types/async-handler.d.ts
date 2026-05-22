import type { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => any;
