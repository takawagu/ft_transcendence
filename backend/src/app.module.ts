import { Module } from '@nestjs/common';
import { ItoModule } from './ito/ito.module';

@Module({
  imports: [ItoModule],
})
export class AppModule {}
