import { Router } from 'express';

import {
  findProductById,
  createProduct,
  getPriceRanges,
  filterProductByPriceRange,
  filterProductsBySeller,
  updateProduct,
  getProducts,
  deleteProduct,
  addProductReview,
  deleteProductReview,
  getAvailableQuantityAndSales,
  buyProduct,
  archiveProduct,
  unarchiveProduct,
  cancelProduct,
} from '../controllers/product.controller';

const productRouter = Router();

productRouter.get('/price-ranges', getPriceRanges);
productRouter.get('/filter-by-price', filterProductByPriceRange);
productRouter.get('/filter-by-seller', filterProductsBySeller);
productRouter.get('/available-quantity-sales/:id', getAvailableQuantityAndSales);

productRouter.patch('/buy/:id', buyProduct);
productRouter.patch('/archive/:id', archiveProduct);
productRouter.patch('/unarchive/:id', unarchiveProduct);
productRouter.patch('/cancel/:id', cancelProduct);

productRouter.post('/:id/reviews', addProductReview);
productRouter.delete('/:id/reviews/:review_id', deleteProductReview);

productRouter.get('/', getProducts);
productRouter.post('/', createProduct);
productRouter.get('/:id', findProductById);
productRouter.delete('/:id', deleteProduct);
productRouter.patch('/:id', updateProduct);

export default productRouter;
