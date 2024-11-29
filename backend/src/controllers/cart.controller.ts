import { Request, Response } from 'express';
import userRepo from '../database/repositories/user.repo';
import { ResponseStatusCodes } from '../types/ResponseStatusCodes.types';
import productRepo from '../database/repositories/product.repo';
import { logger } from '../middlewares/logger.middleware';

class CartController {
  async getCart(req: Request, res: Response) {
    const user = await userRepo.getUserCart(req.user.userId);

    res.status(ResponseStatusCodes.OK).json({
      message: 'Cart fetched successfully',
      cart: user?.cart,
    });
  }

  async addProduct(req: Request, res: Response) {
    const { productId, quantity } = req.body;

    try {
      const product = await productRepo.getProductById(productId);

      if (!product) {
        throw new Error('Product not found');
      }

      const user = await userRepo.findUserById(req.user.userId);
      const productInCart = user?.cart?.find((item: any) => item.product.toString() === productId);
      const stock = product.available_quantity ?? 0;

      if (productInCart) {
        throw new Error('Product already in cart');
      }

      if (stock < quantity) {
        throw new Error('Product not available in the requested quantity');
      }

      const updatedUser = await userRepo.addProductToCart(req.user.userId, productId, quantity);

      res.status(ResponseStatusCodes.CREATED).json({
        message: 'Product added to cart successfully',
        cart: updatedUser?.cart,
      });
    } catch (error: any) {
      logger.error('Error adding product to cart', { error: error.message });
      res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Error adding product to cart: ${error.message}`,
      });
    }
  }
}

export default new CartController();
