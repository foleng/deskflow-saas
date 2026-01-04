import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: true, // 允许任何来源 (自动反射请求头里的 Origin)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // 允许携带 Cookie 和 Authorization 头
  })
  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()
