import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { ApikeyProviders } from './apikey/apikey.provider';
import { ApikeyService } from './apikey/apikey.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserProviders } from './user/user.provider';
import { appName } from './utils';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [AppController],
      providers: [
        AppService,
        ApikeyService,
        ...UserProviders,
        ...ApikeyProviders,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it(`Welcome to the ${appName}`, () => {
      expect(appController.getHello()).toStrictEqual({
        message: `Welcome to the ${appName}`,
      });
    });
  });
});
