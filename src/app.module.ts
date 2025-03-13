import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProducerService } from './kafka/producer/producer.service';
import { ConsumerService } from './kafka/consumer/consumer.service';
import { KafkaModule } from './kafka/kafka.module';
import { HttpModule } from '@nestjs/axios';
import { ApikeyModule } from './apikey/apikey.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    KafkaModule,
    HttpModule,
    ApikeyModule,
  ],
  controllers: [AppController],
  providers: [AppService, ProducerService, ConsumerService],
})
export class AppModule {}
