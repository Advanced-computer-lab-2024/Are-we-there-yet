import { OrderItemType, OrderStatusType } from '../../types/Order.types';
import { Order } from '../models/order.model';

class OrderRepo {
  async getOrders(past: string) {
    let query = {
      status: { $in: [OrderStatusType.PENDING] },
    };

    if (past === 'true') {
      query = {
        status: { $in: [OrderStatusType.DELIVERED, OrderStatusType.CANCELLED] },
      };
    }

    return await Order.find(query).populate('products.product');
  }

  async checkoutOrder(userId: string, totalPrice: Number, cart?: OrderItemType[]) {
    return await Order.create({ products: cart, totalPrice, created_by: userId });
  }
}
export default new OrderRepo();
