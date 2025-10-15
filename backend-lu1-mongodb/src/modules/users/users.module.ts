import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schema/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from '../../service/users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // zodat andere modules (zoals Favorites) de service kunnen gebruiken
})
export class UsersModule {}
