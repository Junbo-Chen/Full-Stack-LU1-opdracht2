import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { FavoriteService } from './favorite.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoriteService) {}

  // Add favorite
  @Post()
  async addFavorite(@Body() body: { userId: string; courseId: string }) {
    return this.favoritesService.addFavorite(body.userId, body.courseId);
  }

  // Get all favorites for user
  @Get(':userId')
  async getFavorites(@Param('userId') userId: string) {
    return this.favoritesService.getFavorites(userId);
  }

  // Remove favorite (DELETE with body)
  @Delete()
  async removeFavorite(@Body() body: { userId: string; courseId: string }) {
    await this.favoritesService.removeFavorite(body.userId, body.courseId);
    return { message: 'Favorite removed successfully' };
  }

  // Check if module is favorite (bonus endpoint)
  @Get(':userId/:courseId')
  async isFavorite(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string
  ) {
    const favorites = await this.favoritesService.getFavorites(userId);
    const isFavorite = favorites.some(f => f.courseId === courseId);
    return { isFavorite };
  }

  // Get favorite count for user (bonus endpoint)
  @Get(':userId/count')
  async getFavoriteCount(@Param('userId') userId: string) {
    const favorites = await this.favoritesService.getFavorites(userId);
    return { count: favorites.length };
  }
}