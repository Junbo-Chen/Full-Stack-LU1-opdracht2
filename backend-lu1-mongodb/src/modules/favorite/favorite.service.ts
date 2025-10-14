import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite } from './schemas/favorite.schema';

@Injectable()
export class FavoriteService {
  constructor(@InjectModel(Favorite.name) private favoriteModel: Model<Favorite>) {}

  async addFavorite(userId: string, courseId: string): Promise<Favorite> {
    console.log('➕ Adding favorite:', { userId, courseId });
    
    // Check if already exists
    const exists = await this.favoriteModel.findOne({ userId, courseId });
    if (exists) {
      console.log('ℹ️ Favorite already exists');
      return exists;
    }
    
    const favorite = new this.favoriteModel({ userId, courseId });
    const saved = await favorite.save();
    console.log('✅ Favorite added:', saved._id);
    return saved;
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    console.log('📥 Getting favorites for user:', userId);
    const favorites = await this.favoriteModel.find({ userId }).exec();
    console.log('✅ Found favorites:', favorites.length);
    return favorites;
  }

  async removeFavorite(userId: string, courseId: string): Promise<void> {
    console.log('➖ Removing favorite:', { userId, courseId });
    const result = await this.favoriteModel.deleteOne({ userId, courseId }).exec();
    console.log('✅ Favorite removed, deleted count:', result.deletedCount);
  }
}