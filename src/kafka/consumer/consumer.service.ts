import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { KafkaTopics, kafkaUrl } from 'src/utils';

@Injectable()
export class ConsumerService implements OnModuleInit {
  async onModuleInit() {
    const kafka = new Kafka({ brokers: [kafkaUrl] });
    const consumer = kafka.consumer({ groupId: 'auth-group' });

    await consumer.connect();
    await consumer.subscribe({
      topics: Object.values(KafkaTopics),
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        console.log(
          '\n',
          `🚀 ${topic} Event Received:`,
          message.value.toString(),
          '\n',
        );
      },
    });
  }
}
