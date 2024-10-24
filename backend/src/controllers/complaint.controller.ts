import { Request, Response } from 'express';
import ComplaintRepo from '../database/repositories/complaint.repo';
import { logger } from '../middlewares/logger.middleware';
import { ResponseStatusCodes } from '../types/ResponseStatusCodes.types';

class ComplaintController {
  async fileComplaint(req: Request, res: Response) {
    const submittedComplaint = req.body;
    submittedComplaint.created_by = req.user.userId;

    try {
      const newComplaint = await ComplaintRepo.fileComplaint(submittedComplaint);
      res.status(ResponseStatusCodes.CREATED).json({ message: 'Complaint filed successfully', data: { newComplaint } });
    } catch (error: any) {
      logger.error(`Error filing complaint: ${error.message}`);
      res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
    }
  }

  async getComplaints(req: Request, res: Response) {
    try {
      const complaints = await ComplaintRepo.getComplaints();
      res.status(ResponseStatusCodes.OK).send({ message: 'Complaints retrieved successfully', data: { complaints } });
    } catch (error: any) {
      logger.error(`Error getting complaints: ${error.message}`);
      res.status(ResponseStatusCodes.BAD_REQUEST).send({ message: error.message, data: [] });
    }
  }

  async getComplaintById(req: Request, res: Response) {
    try {
      const complaint = await ComplaintRepo.getComplaintById(req.params.id);
      res.status(ResponseStatusCodes.OK).send({ message: 'Complaint retrieved successfully', data: { complaint } });
    } catch (error: any) {
      logger.error(`Error getting complaint: ${error.message}`);
      res.status(ResponseStatusCodes.BAD_REQUEST).send({ message: error.message, data: [] });
    }
  }

  async getMyComplaints(req: Request, res: Response) {
    try {
      const complaints = await ComplaintRepo.getMyComplaints(req.user.userId);
      res
        .status(ResponseStatusCodes.OK)
        .send({ message: 'My complaints retrieved successfully', data: { complaints } });
    } catch (error: any) {
      logger.error(`Error getting my complaints: ${error.message}`);
      res.status(ResponseStatusCodes.BAD_REQUEST).send({ message: error.message, data: [] });
    }
  }

  async updateComplaint(req: Request, res: Response) {
    try {
      const updatedComplaint = await ComplaintRepo.updateComplaint(req.params.id, req.body);
      res
        .status(ResponseStatusCodes.OK)
        .send({ message: 'Complaint updated successfully', data: { updatedComplaint } });
    } catch (error: any) {
      logger.error(`Error updating complaint: ${error.message}`);
      res.status(ResponseStatusCodes.BAD_REQUEST).send({ message: error.message, data: [] });
    }
  }
}

export default new ComplaintController();
