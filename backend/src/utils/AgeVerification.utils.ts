import userRepo from '../database/repositories/user.repo';
import { UserType } from '../types/User.types';

async function checkLegalAge(dob: Date): Promise<boolean> {
  try {
    if (isNaN(dob.getTime())) {
      throw new Error('Invalid date format');
    }

    const birthYear = dob.getFullYear();
    const curYear = new Date().getFullYear();
    return curYear - birthYear >= 18;
  } catch (error) {
    console.error('Error parsing date of birth:', error);
    return false;
  }
}

export async function checkUserLegalAge(userId: string): Promise<boolean> {
  const user: UserType | null = await userRepo.findUserById(userId);

  if (user) {
    const dob = user.dob;
    if (dob) return await checkLegalAge(dob);
  }
  return false;
}
