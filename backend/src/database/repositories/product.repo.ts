import { ObjectId } from 'mongodb';
import Validator from '../../utils/Validator.utils';
import { Product } from '../models/product.model';
import { ProductType } from '../../types/Product.types';

class ProductRepo {
  async findProductById(id: string) {
    Validator.validateId(id, 'Invalid product ID');
    return await Product.findById({ _id: new ObjectId(id) }).populate(['tags', 'pictures']);
  }

  async getProductById(id: string) {
    Validator.validateId(id, 'Invalid product ID');
    return await Product.findById({ _id: new ObjectId(id) }).populate(['tags', 'pictures']);
  }

  async createProduct(product: any) {
    return await Product.create(product);
  }

  async updateProduct(id: string, data: any) {
    Validator.validateId(id, 'Invalid product ID');
    return await Product.updateOne({ _id: new ObjectId(id) }, data);
  }

  async deleteProduct(id: string) {
    Validator.validateId(id, 'Invalid product ID');
    return await Product.deleteOne({ _id: new ObjectId(id) });
  }

  async getProducts(attributeName?: string, attributeValue?: RegExp | string) {
    const query = attributeName && attributeValue ? { [attributeName]: attributeValue } : {};
    return await Product.find(query).populate(['tags', 'pictures']);
  }

  async getPriceMinMax() {
    return await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);
  }

  async getProductsByPriceRange(minPrice: number, maxPrice: number) {
    return await Product.find({ price: { $gte: minPrice, $lte: maxPrice } }).populate(['tags', 'pictures']);
  }

  async filterProductsBySeller(seller: string) {
    return await Product.find({ seller });
  }

  async addReview(productId: string, review: any) {
    return await Product.updateOne({ _id: new ObjectId(productId) }, { $push: { reviews: review } });
  }

  async deleteReview(productId: string, reviewId: string) {
    return await Product.updateOne(
      { _id: new ObjectId(productId) },
      { $pull: { reviews: { _id: new ObjectId(reviewId) } } }
    );
  }

  async getAvailableQuantity(productId: string) {
    return await Product.findById({ _id: new ObjectId(productId) });
  }

  async getProductSales(productId: string) {
    return await Product.findById({ _id: new ObjectId(productId) });
  }

  async buyProduct(productId: string, quantity: number) {
    return await Product.updateOne(
      { _id: new ObjectId(productId) },
      {
        $inc: {
          available_quantity: -quantity, // Decrease available quantity
          sales: quantity, // Increase sales by quantity sold
        },
      }
    );
  }

  async archiveProduct(productId: string) {
    return await Product.updateOne({ _id: new ObjectId(productId) }, { archive: true });
  }
}
export default new ProductRepo();
