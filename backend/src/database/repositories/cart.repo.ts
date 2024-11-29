import { UserType } from '../../types/User.types';
import { User } from '../models/user.model';
import { ObjectId } from 'mongodb';

class CartRepo {
  async getUserCart(id: string): Promise<UserType | null> {
    return await User.findById(id).populate('cart.product');
  }

  async addProductToCart(userId: string, productId: string, quantity: number) {
    const cartItem = {
      product: new ObjectId(productId),
      quantity: quantity,
    };

    return await User.findByIdAndUpdate(userId, { $push: { cart: cartItem } }, { new: true });
  }

  async removeProductFromCart(userId: string, productId: string) {
    return await User.findByIdAndUpdate(userId, { $pull: { cart: { product: productId } } }, { new: true });
  }
}

export default new CartRepo();
