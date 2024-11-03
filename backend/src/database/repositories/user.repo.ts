import { ObjectId } from 'mongodb';
import { User } from '../models/user.model';
import { UserType } from '../../types/User.types';
import { accountType } from '../../types/User.types';

class UserRepository {
  async getUsers() {
    return await User.find();
  }

  async findUserById(id: string): Promise<UserType | null> {
    return await User.findById({ _id: new ObjectId(id) });
  }

  async createUser(user: UserType) {
    const userRes = await User.create(user);
    return userRes;
  }

  async getUsersByType(type: accountType): Promise<UserType[]> {
    return await User.find({ account_type: type });
  }

  async updateUser(id: string, user: UserType) {
    return await User.updateOne({ _id: new ObjectId(id) }, user);
  }

  async acceptUser(id: string) {
    return await User.updateOne({ _id: new ObjectId(id) }, { accepted: true });
  }

  async findUserByEmail(email: string): Promise<UserType | null> {
    return await User.findOne({ email: email });
  }

  async requestAccountDeletion(id: string) {
    return await User.updateOne({ _id: new ObjectId(id) }, { deletionRequested: true });
  }

  async deleteUser(id: string) {
    return await User.deleteOne({ _id: new ObjectId(id) });
  }
}

export default new UserRepository();
