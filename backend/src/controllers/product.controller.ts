import { Request, Response } from 'express';
var mongoose = require('mongoose');
import { logger } from '../middlewares/logger.middleware';
import { ResponseStatusCodes } from '../types/ResponseStatusCodes.types';
import { range } from '../utils/Rangify.utils';
import { generateRanges } from '../utils/Rangify.utils';

import productRepo from '../database/repositories/product.repo';
import currencyConverterService from '../services/currencyConverter';
import userRepo from '../database/repositories/user.repo';

const findProductById = async (req: Request, res: Response) => {
  try {
    const product = await productRepo.findProductById(req.params.id);
    if (!product) {
      throw new Error('Product not found');
    }
    const response = {
      message: 'Product fetched successfully',
      data: { product: product },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error fetching product: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    await productRepo.deleteProduct(req.params.id);
    const response = {
      message: 'Product deleted successfully',
      data: { productId: req.params.id },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error deleting product: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const getProducts = async (req: Request, res: Response) => {
  try {
    let products = await productRepo.getProducts();

    const currency: string = await currencyConverterService.getRequestCurrency(req);
    products = await Promise.all(
      products.map(async (product) => {
        if (!product.price) {
          product.price = 0;
        }
        product.price = await currencyConverterService.convertPrice(product.price, currency);
        return product;
      })
    );

    const response = {
      message: 'Products fetched successfully',
      data: { products },
      currency: currency,
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error fetching products: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const createProduct = async (req: Request, res: Response) => {
  const product = req.body;
  product.created_by = req.user.userId;

  try {
    const newProduct = await productRepo.createProduct(product);
    const response = {
      message: 'Product created successfully',
      data: { productId: newProduct._id },
    };

    res.status(ResponseStatusCodes.CREATED).json(response);
  } catch (error: any) {
    logger.error(`Error creating product: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const getPriceRanges = async (req: Request, res: Response) => {
  try {
    const ranges = await productRepo.getPriceMinMax();
    if (!ranges.length) {
      throw new Error('No price ranges found');
    }
    const rangesCount = req.query.rangesCount ? parseInt(req.query.rangesCount as string) : 5;
    const rangesList: range[] = await generateRanges(ranges[0].minPrice, ranges[0].maxPrice, rangesCount);

    const response = {
      message: 'Price ranges fetched successfully',
      data: rangesList,
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error fetching price ranges: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

async function filterProductByPriceRange(req: Request, res: Response) {
  try {
    const minPrice: number = parseInt(req.query.minPrice as string);
    const maxPrice: number = parseInt(req.query.maxPrice as string);

    const products = await productRepo.getProductsByPriceRange(minPrice, maxPrice);
    const response = {
      message: 'Products fetched successfully',
      data: { products },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error fetching products: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
}

async function filterProductsBySeller(req: Request, res: Response) {
  try {
    const seller = req.query.seller as string;
    const products = await productRepo.filterProductsBySeller(seller);
    const response = {
      message: 'Products fetched successfully',
      data: { products },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error fetching products: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
}

async function updateProduct(req: Request, res: Response) {
  try {
    const productId = req.params.id;
    const product = req.body;
    await productRepo.updateProduct(productId, product);
    const response = {
      message: 'Product updated successfully',
      data: { productId },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error updating product: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
}

async function addProductReview(req: Request, res: Response) {
  try {
    const productId = req.params.id;
    const review = req.body;

    const product = await productRepo.getProductById(productId);
    if (!product) {
      res.status(ResponseStatusCodes.NOT_FOUND).json({ message: 'Product not found', data: [] });
      return;
    }

    const reviews = product.reviews || [];
    const previousRating = product.average_rating || 0;
    const newRating: number = (previousRating * reviews.length + review.rating) / (reviews.length + 1);
    await productRepo.addReview(productId, review);
    await productRepo.updateProduct(productId, { average_rating: newRating });
    const response = {
      message: 'Review added successfully',
      data: { productId },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error adding review: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
}

async function deleteProductReview(req: Request, res: Response) {
  try {
    const productId = req.params.id;
    const reviewId = new mongoose.Types.ObjectId(req.params.review_id);

    const product = await productRepo.getProductById(productId);
    if (!product) {
      res.status(ResponseStatusCodes.NOT_FOUND).json({ message: 'Product not found', data: [] });
      return;
    }

    const reviews = product.reviews || [];
    const reviewIndex = reviews.findIndex((review) => review._id.toString() === reviewId.toString());
    if (reviewIndex === -1) {
      res.status(ResponseStatusCodes.NOT_FOUND).json({ message: 'Review not found', data: [] });
      return;
    }
    if (!reviews.length) {
      res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: 'No reviews found', data: [] });
      return;
    }

    const previousRating = product.average_rating || 0;
    const newRating: number =
      (previousRating * reviews.length - (reviews[reviewIndex].rating ? reviews[reviewIndex].rating : 0)) /
      (reviews.length - 1);
    await productRepo.deleteReview(productId, reviewId);
    await productRepo.updateProduct(productId, { average_rating: newRating });
    const response = {
      message: 'Review deleted successfully',
      data: { productId },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error deleting review: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
}

async function getAvailableQuantityAndSales(req: Request, res: Response) {
  try {
    const productId = req.params.id;
    const product = await productRepo.getProductById(productId);
    if (!product) {
      res.status(ResponseStatusCodes.NOT_FOUND).json({ message: 'Product not found', data: [] });
      return;
    }
    const sales = product.sales ?? 0;
    const price = product.price ?? 0;
    const totalSalesValue = sales * price;
    res.status(ResponseStatusCodes.OK).json({
      message: 'Product fetched successfully',
      data: { available_quantity: product.available_quantity, sales: totalSalesValue },
    });
  } catch (error: any) {
    logger.error(`Error fetching product: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
}

async function buyProduct(req: Request, res: Response) {
  try {
    const productId = req.params.id;
    const quantity = parseInt(req.body.quantity);
    const product = await productRepo.getProductById(productId);

    if (!product) {
      res.status(ResponseStatusCodes.NOT_FOUND).json({ message: 'Product not found', data: [] });
      return;
    }

    if (product.available_quantity && product.available_quantity < quantity) {
      res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: 'Insufficient quantity', data: [] });
      return;
    }

    await productRepo.buyProduct(productId, quantity);
    await userRepo.buyProduct(req.user.userId, productId);

    res.status(ResponseStatusCodes.OK).json({ message: 'Product bought successfully', data: { productId, quantity } });
  } catch (error: any) {
    logger.error(`Error buying product: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
}

async function archiveProduct(req: Request, res: Response) {
  try {
    const productId = req.params.id;
    await productRepo.archiveProduct(productId);
    res.status(ResponseStatusCodes.OK).json({ message: 'Product archived successfully', data: { productId } });
  } catch (error: any) {
    logger.error(`Error archiving product: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
}

async function unarchiveProduct(req: Request, res: Response) {
  try {
    const productId = req.params.id;
    await productRepo.unarchiveProduct(productId);
    res.status(ResponseStatusCodes.OK).json({ message: 'Product unarchived successfully', data: { productId } });
  } catch (error: any) {
    logger.error(`Error unarchiving product: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
}

export {
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
  unarchiveProduct,
  buyProduct,
  archiveProduct,
};
