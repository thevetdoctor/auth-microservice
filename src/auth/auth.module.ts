import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { KafkaModule } from '../kafka/kafka.module';
import { expiryDuration, jwtSecret } from 'src/utils';
import { UserModule } from 'src/user/user.module';
import { ApikeyService } from 'src/apikey/apikey.service';
import { ApikeyProviders } from 'src/apikey/apikey.provider';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret, // Use ENV for security
      signOptions: { expiresIn: expiryDuration },
    }),
    KafkaModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ApikeyService, ...ApikeyProviders],
  exports: [AuthService],
})
export class AuthModule {}
