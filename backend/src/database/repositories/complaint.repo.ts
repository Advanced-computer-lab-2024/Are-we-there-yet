import { ComplaintType } from '../../types/Complaint.types';
import { Complaint } from '../models/complaint.model';

class ComplaintRepo {
  async fileComplaint(complaint: ComplaintType) {
    return await Complaint.create(complaint);
  }

  async getComplaints() {
    return await Complaint.find();
  }

  async getComplaintById(id: string) {
    return await Complaint.findById(id);
  }

  async getMyComplaints(userId: string) {
    return await Complaint.find({ created_by: userId });
  }
}

export default new ComplaintRepo();
