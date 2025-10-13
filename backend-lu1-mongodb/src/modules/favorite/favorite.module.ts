import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { FavoritesController } from './favorite.controller';
import { FavoriteService } from './favorite.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Favorite.name, schema: FavoriteSchema }])],
  controllers: [FavoritesController],
  providers: [FavoriteService],
})
export class FavoritesModule {}
