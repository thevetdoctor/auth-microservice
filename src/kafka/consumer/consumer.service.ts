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
      topics: [KafkaTopics.MAIL_SENT],
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const msg = JSON.parse(message.value.toString());
        console.log(
          '\n',
          `🚀 Event Received: ${topic}`,
          `${msg.topic}`,
          msg,
          '\n',
        );
      },
    });
  }
}
