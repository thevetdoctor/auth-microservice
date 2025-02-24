import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProducerService } from 'src/kafka/producer/producer.service';
import { UserService } from 'src/user/user.service';
import {
  checkForRequiredFields,
  KafkaTopics,
  validateEmailField,
  validatePassword,
} from 'src/utils';
import { LoginDTO, SignupDTO } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly kafkaProducer: ProducerService,
  ) {}

  async login(payload: LoginDTO, clientIp: string, deviceInfo: string) {
    const currentTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long', // Use 'short' or '2-digit' for different formats
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
    try {
      const { email, password } = payload;

      checkForRequiredFields(['email', 'password'], payload);
      validateEmailField(email);
      validatePassword(password);
      const record = await this.userService.findUserByEmail(email);
      if (!record) {
        throw new BadRequestException('User not found');
      }
      const token = this.jwtService.sign(payload);

      // 🔥 Send login event to Kafka
      await this.kafkaProducer.sendMessage(KafkaTopics.USER_LOGIN, {
        email: payload.email,
        clientIp,
        deviceInfo,
        currentTime,
      });
      return { accessToken: token };
    } catch (e) {
      // 🔥 Send login error event to Kafka
      await this.kafkaProducer.sendMessage(KafkaTopics.USER_LOGIN_ERROR, {
        email: payload.email,
        clientIp,
        deviceInfo,
        currentTime,
        error: e.message,
      });
      throw new BadRequestException(e.message);
    }
  }

  async signup(payload: SignupDTO, clientIp: string, deviceInfo: string) {
    const currentTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long', // Use 'short' or '2-digit' for different formats
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
    try {
      const user = await this.userService.createUser(payload);

      // 🔥 Send signup event to Kafka
      await this.kafkaProducer.sendMessage(KafkaTopics.USER_SIGNUP, {
        ...user,
        clientIp,
        deviceInfo,
        currentTime,
      });
      return { user };
    } catch (e) {
      // 🔥 Send signup error event to Kafka
      await this.kafkaProducer.sendMessage(KafkaTopics.USER_SIGNUP_ERROR, {
        payload,
        clientIp,
        deviceInfo,
        currentTime,
        error: e.message,
      });
      throw new BadRequestException(e.message);
    }
  }
}
