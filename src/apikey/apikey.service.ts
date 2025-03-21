import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Users } from 'src/user/user.entity';
import { APIKEY_REPOSITORY, USER_REPOSITORY } from 'src/utils';
import { Apikeys } from './apikey.entity';
const randomId = require('oba-random-id');

@Injectable()
export class ApikeyService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: typeof Users,
    @Inject(APIKEY_REPOSITORY)
    private readonly apikeyRepo: typeof Apikeys,
  ) {}

  async validateApiKey(apiKey: string): Promise<Apikeys | null> {
    try {
      const apikey = await this.apikeyRepo.findOne({
        where: { key: apiKey },
        attributes: ['key', 'userId', 'isActive', 'email'],
        raw: true,
      });
      console.log('apikey', apikey);
      if (!apikey) {
        throw new UnauthorizedException('Invalid API Credentials');
      }
      if (!apikey.isActive) {
        throw new UnauthorizedException('Inactive API Credentials');
      }
      const userId = await this.userRepo.findOne({
        where: { id: apikey.userId },
        attributes: ['id'],
        raw: true,
      });
      console.log('userId', userId);
      if (!userId) {
        throw new UnauthorizedException('Invalid API User');
      }
      return apikey;
    } catch (e) {
      throw e.message;
    }
  }

  async generateApiKey(userId: string): Promise<string> {
    try {
      const newKey = randomId(20, 'all');
      await this.apikeyRepo.create({ key: newKey, userId, isActive: true });
      return newKey;
    } catch (e) {
      throw e.message;
    }
  }
}
