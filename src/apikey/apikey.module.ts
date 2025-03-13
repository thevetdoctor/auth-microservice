import { Module } from '@nestjs/common';
import { UserProviders } from 'src/user/user.provider';
import { UserService } from 'src/user/user.service';
import { ApikeyProviders } from './apikey.provider';
import { ApikeyService } from './apikey.service';

@Module({
  providers: [ApikeyService, UserService, ...UserProviders, ...ApikeyProviders],
  exports: [ApikeyService],
})
export class ApikeyModule {}
