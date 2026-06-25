import { Module } from '@nestjs/common';
import { ItoGateway } from './ito.gateway';
import { ItoService } from './ito.service';

@Module({
  providers: [ItoGateway, ItoService],
})
export class ItoModule {}
