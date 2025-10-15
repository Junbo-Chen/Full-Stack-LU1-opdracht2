import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from '../../schema/favorite.schema';
import { FavoritesController } from './favorite.controller';
import { FavoriteService } from '../../service/favorite.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Favorite.name, schema: FavoriteSchema }])],
  controllers: [FavoritesController],
  providers: [FavoriteService],
})
export class FavoritesModule {}
