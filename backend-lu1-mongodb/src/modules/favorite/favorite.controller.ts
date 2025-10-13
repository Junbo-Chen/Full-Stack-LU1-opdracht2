import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { FavoriteService } from './favorite.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoriteService) {}

  @Post()
  async addFavorite(@Body() body: { userId: string; courseId: string }) {
    return this.favoritesService.addFavorite(body.userId, body.courseId);
  }

  @Get(':userId')
  async getFavorites(@Param('userId') userId: string) {
    return this.favoritesService.getFavorites(userId);
  }

  @Delete()
  async removeFavorite(@Body() body: { userId: string; courseId: string }) {
    return this.favoritesService.removeFavorite(body.userId, body.courseId);
  }
}
