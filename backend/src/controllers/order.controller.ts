import { Request, Response } from 'express';
import { logger } from '../middlewares/logger.middleware';
import { ResponseStatusCodes } from '../types/ResponseStatusCodes.types';
import orderRepo from '../database/repositories/order.repo';
import userRepo from '../database/repositories/user.repo';
import cartRepo from '../database/repositories/cart.repo';
import { OrderItemType } from '../types/Order.types';
import { ProductType } from '../types/Product.types';

class OrderController {
  async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await orderRepo.getOrders(req.query.past as string);
      res.status(ResponseStatusCodes.OK).json({ message: 'Orders fetched successfully', data: { orders: orders } });
    } catch (error: any) {
      logger.error(`Error fetching orders: ${error.message}`);
      res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
    }
  }

  async checkoutOrder(req: Request, res: Response) {
    const user = await cartRepo.getUserCart(req.user.userId);
    try {
      const cart = user?.cart || [];

      if (cart.length === 0) {
        throw new Error('Cart is empty');
      }

      let totalOrderPrice = 0;
      cart.forEach((cartItem) => {
        const product = cartItem.product as ProductType;

        totalOrderPrice += product.price * cartItem.quantity;
      });

      const order = await orderRepo.checkoutOrder(req.user.userId, totalOrderPrice, cart);

      res
        .status(ResponseStatusCodes.CREATED)
        .json({ message: 'Order checked out successfully', data: { order: order } });
    } catch (error: any) {
      logger.error(`Error checking out order: ${error.message}`);
      res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
    }
  }
}

export default new OrderController();
