import { Test, TestingModule } from '@nestjs/testing';
import { expiryDuration, jwtSecret } from 'src/utils';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { KafkaModule } from 'src/kafka/kafka.module';
import { UserModule } from 'src/user/user.module';
import { ApikeyService } from 'src/apikey/apikey.service';
import { ApikeyProviders } from 'src/apikey/apikey.provider';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtSecret, // Use ENV for security
          signOptions: { expiresIn: expiryDuration },
        }),
        KafkaModule,
        UserModule,
      ],
      controllers: [AuthController],
      providers: [AuthService, UserService, ApikeyService, ...ApikeyProviders],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
