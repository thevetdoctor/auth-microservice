import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import {
  appName,
  dbUrl,
  feedbackServiceUrl,
  kafkaUrl,
  mailServiceUrl,
  rateLimitCount,
  rateLimiter,
} from './utils';

async function bootstrap() {
  const port = process.env.PORT ?? 3001;
  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors();
    app.use(rateLimiter);

    const config = new DocumentBuilder()
      .setTitle(appName)
      .setDescription(`API Docs for ${appName}`)
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
        'JWT',
      )
      .build();
    const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    await app.listen(port);
    const app_url = await app.getUrl();

    console.log('KAFKA_URL:', kafkaUrl ? kafkaUrl : 'Not Supplied');
    console.log('DB_URL:', dbUrl ? dbUrl : 'Not Supplied');
    console.log(
      'MAIL_SERVICE_URL:',
      mailServiceUrl ? mailServiceUrl : 'Not Supplied',
    );
    console.log(
      'FEEDBACK_SERVICE_URL:',
      feedbackServiceUrl ? feedbackServiceUrl : 'Not Supplied',
    );
    console.log(
      'RATE_LIMIT:',
      rateLimitCount ? rateLimitCount : 'Not Supplied',
    );

    console.log(`Application is running on: ${app_url}`);
    console.log(`Swagger Docs path for ${appName}: ${app_url}/api-docs`);
  } catch (err) {
    console.error('Error starting the application:', err);
  }
}
bootstrap();
