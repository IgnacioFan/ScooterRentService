import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RentsModule } from './rents/rents.module';

@Module({
  imports: [RentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
