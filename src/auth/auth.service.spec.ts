import { Test, TestingModule } from '@nestjs/testing';
import { expiryDuration, jwtSecret } from 'src/utils';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { KafkaModule } from 'src/kafka/kafka.module';
import { UserModule } from 'src/user/user.module';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService],
      imports: [
        JwtModule.register({
          secret: jwtSecret, // Use ENV for security
          signOptions: { expiresIn: expiryDuration },
        }),
        KafkaModule,
        UserModule,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
