import { ObjectId } from 'mongodb';
import { Museum } from '../models/museum.model';
import { MuseumType } from '../../types/Museum.types';
import Validator from '../../utils/Validator.utils';

class MuseumRepo {
  async getAllMuseums(attributeName?: string, attributeValue?: RegExp | string) {
    const query = attributeName && attributeValue ? { [attributeName]: attributeValue } : {};
    return Museum.find(query).populate('tags');
  }
  async findMuseumById(id: string) {
    Validator.validateId(id, 'Invalid museum ID');
    return await Museum.findById(id).populate(['tags', 'pictures']);
  }

  async findMuseumsByTags(tagIds: ObjectId[]) {
    return await Museum.find({ tags: { $all: tagIds } }).populate('tags');
  }

  async createMuseum(museum: MuseumType) {
    const museumRes = await Museum.create(museum);
    return museumRes;
  }

  async updateMuseum(id: string, museum: MuseumType) {
    Validator.validateId(id, 'Invalid museum ID');
    return await Museum.findByIdAndUpdate(id, museum);
  }

  async deleteMuseum(id: string) {
    Validator.validateId(id, 'Invalid museum ID');
    return await Museum.deleteOne({ _id: new ObjectId(id) });
  }

  async getMuseumsByCreator(creator: string) {
    return await Museum.find({ created_by: creator }).populate('tags');
  }
}

export default new MuseumRepo();
