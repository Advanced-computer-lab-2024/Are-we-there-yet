import { Request, Response } from 'express';
import userRepo from '../../database/repositories/user.repo';
import { logger } from '../../middlewares/logger.middleware';
import { ResponseStatusCodes } from '../../types/ResponseStatusCodes.types';
import { accountType } from '../../types/User.types';

const createAdmin = async (req: Request, res: Response) => {
  try {
    const admin = req.body;
    const newAdmin = await userRepo.createUser(admin);
    const response = {
      message: 'admin created successfully',
      data: { adminId: newAdmin._id },
    };

    res.status(ResponseStatusCodes.CREATED).json(response);
  } catch (error: any) {
    logger.error(`Error creating admin: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const getAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await userRepo.getUsersByType(accountType.Admin);
    const response = {
      message: 'admins fetched successfully',
      data: { admins: admins },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error fetching admins: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const updateAdmin = async (req: Request, res: Response) => {
  try {
    const admin = req.body;
    await userRepo.updateUser(req.params.id, admin);
    const response = {
      message: 'admin updated successfully',
      data: { adminId: req.params.id },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error updating admin: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

export { createAdmin, getAdmins, updateAdmin };
