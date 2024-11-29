import { Request, Response } from 'express';
import CartRepo from '../database/repositories/cart.repo';
import { ResponseStatusCodes } from '../types/ResponseStatusCodes.types';
import productRepo from '../database/repositories/product.repo';
import { logger } from '../middlewares/logger.middleware';
import userRepo from '../database/repositories/user.repo';

class CartController {
  async getCart(req: Request, res: Response) {
    const user = await CartRepo.getUserCart(req.user.userId);

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

      const updatedUser = await CartRepo.addProductToCart(req.user.userId, productId, quantity);

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

  async removeProduct(req: Request, res: Response) {
    try {
      const user = await userRepo.findUserById(req.user.userId);
      const productExists = user?.cart?.find((item: any) => item.product.toString() === req.params.productId);

      if (!productExists) {
        throw new Error('Product not found in cart');
      }

      const updatedUser = await CartRepo.removeProductFromCart(req.user.userId, req.params.productId);
      res.status(ResponseStatusCodes.OK).json({
        message: 'Product removed from cart successfully',
        cart: updatedUser?.cart,
      });
    } catch (error: any) {
      logger.error('Error removing product from cart', { error: error.message });
      res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Error removing product from cart: ${error.message}`,
      });
    }
  }
}

export default new CartController();
