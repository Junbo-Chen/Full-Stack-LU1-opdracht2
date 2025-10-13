import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite } from './schemas/favorite.schema';

@Injectable()
export class FavoriteService {
  constructor(@InjectModel(Favorite.name) private favoriteModel: Model<Favorite>) {}

  async addFavorite(userId: string, courseId: string): Promise<Favorite> {
    const exists = await this.favoriteModel.findOne({ userId, courseId });
    if (exists) return exists;
    const favorite = new this.favoriteModel({ userId, courseId });
    return favorite.save();
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return this.favoriteModel.find({ userId }).exec();
  }

  async removeFavorite(userId: string, courseId: string): Promise<void> {
    await this.favoriteModel.deleteOne({ userId, courseId }).exec();
  }
}
