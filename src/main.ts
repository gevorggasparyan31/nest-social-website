import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessage: string | null = Object.values(
          errors[0].constraints ?? {},
        )[0];

        return new BadRequestException({
          success: false,
          message: errorMessage,
        });
      },
    }),
  );

  setupSwagger(app);

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);

  console.log(`Server running on port: ${port}`);
  console.log(`Swagger documentation: http://127.0.0.1:${port}/api`);
}
bootstrap();
