import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { FilesService } from './files.service';
import { FilesController } from './files.controller';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [ConfigModule]
})
export class FilesModule {}

// Asegurarse de que ConfigService esté disponible en el contexto de FilesModule.
// Esto se puede hacer importando el módulo que proporciona ConfigService en FilesModule.
