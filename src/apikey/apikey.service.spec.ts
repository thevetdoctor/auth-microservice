import { Test, TestingModule } from '@nestjs/testing';
import { UserProviders } from 'src/user/user.provider';
import { UserService } from 'src/user/user.service';
import { ApikeyProviders } from './apikey.provider';
import { ApikeyService } from './apikey.service';

describe('ApikeyService', () => {
  let service: ApikeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApikeyService,
        UserService,
        ...UserProviders,
        ...ApikeyProviders,
      ],
    }).compile();

    service = module.get<ApikeyService>(ApikeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
