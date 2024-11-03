import { Request, Response } from 'express';
import AuthRepo from '../database/repositories/auth/auth.repo';
import { ResponseStatusCodes } from '../types/ResponseStatusCodes.types';
import { logger } from '../middlewares/logger.middleware';
import Validator from '../utils/Validator.utils';
import AuthService from '../services/auth.service';
import userRepo from '../database/repositories/user.repo';
import bcrypt from 'bcrypt';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      Validator.validatePassword(req.body.password);

      const user = await AuthRepo.register(req.body);
      const token = AuthService.generateAccessToken({ userId: user.id, accountType: req.body.account_type });

      res.send({ message: 'User registered successfully', data: { user: user, jwt: token } });
    } catch (error: any) {
      logger.error(`Error creating user: ${error}`);
      res.status(ResponseStatusCodes.BAD_REQUEST).send({ message: error.message, data: null });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const user = await userRepo.findUserByEmail(req.body.email);

      if (!user) {
        res.status(ResponseStatusCodes.NOT_FOUND).send({ message: 'User not found', data: null });
        return;
      }

      const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
      if (!isPasswordValid) {
        res.status(ResponseStatusCodes.BAD_REQUEST).send({ message: 'Invalid password', data: null });
        return;
      }

      const token = AuthService.generateAccessToken({ userId: user?._id, accountType: user?.accountType });
      res.status(ResponseStatusCodes.OK).send({ message: 'User logged in', data: { user: user, jwt: token } });
    } catch (error: any) {
      logger.error(`Error Logging in: ${error}`);
      res.status(ResponseStatusCodes.BAD_REQUEST).send({ message: error.message, data: null });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const user = await AuthRepo.me(req.user.userId);
      res.status(ResponseStatusCodes.OK).send({ message: 'User found', data: { user: user } });
    } catch (error: any) {
      logger.error(`Error getting user: ${error}`);
      res.status(ResponseStatusCodes.BAD_REQUEST).send({ message: error.message, data: null });
    }
  }
}

export default new AuthController();
