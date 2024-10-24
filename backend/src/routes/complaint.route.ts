import { Router } from 'express';
import ComplaintController from '../controllers/complaint.controller';

const complaintRouter = Router();

complaintRouter.post('/', ComplaintController.fileComplaint);
complaintRouter.get('/', ComplaintController.getComplaints);
complaintRouter.get('/mine', ComplaintController.getMyComplaints);
complaintRouter.get('/:id', ComplaintController.getComplaintById);
complaintRouter.patch('/:id', ComplaintController.updateComplaint);

export default complaintRouter;
