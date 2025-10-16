import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS inschakelen voor Angular frontend
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://lu1keuzekompas.netlify.app',  // JE NETLIFY URL
      'https://full-stack-lu1-opdracht2.onrender.com'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`✅ CORS enabled for http://localhost:4200`);
}
bootstrap();
