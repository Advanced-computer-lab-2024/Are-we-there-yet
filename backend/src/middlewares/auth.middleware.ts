import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from './logger.middleware';
import { ResponseStatusCodes } from '../types/ResponseStatusCodes.types';

interface UserPayload {
  userId: string;
  accountType: string;
}

declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
    }
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    logger.error('Access Denied');
    res.status(ResponseStatusCodes.UNAUTHORIZED).send('Access Denied');
    return;
  }

  if (req.header('Authorization')?.split(' ')[0] !== 'Bearer') {
    logger.error('Invalid Token');
    res.status(ResponseStatusCodes.UNAUTHORIZED).send('Invalid Token');
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as UserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    logger.error('Expired Token:', err instanceof Error ? err.message : 'Unknown error');
    res.status(ResponseStatusCodes.FORBIDDEN).send('Expired Token');
  }
};

const openPaths = ['/api/auth/register', '/api/auth/login'];

const authenticateUnlessOpen = (req: Request, res: Response, next: NextFunction) => {
  if (openPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }
  return authenticateToken(req, res, next);
};

export { authenticateToken, authenticateUnlessOpen };
