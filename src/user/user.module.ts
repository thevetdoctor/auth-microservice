import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserProviders } from './user.provider';

@Module({
  providers: [UserService, ...UserProviders],
  controllers: [UserController],
  exports: [UserService, ...UserProviders],
})
export class UserModule {}
