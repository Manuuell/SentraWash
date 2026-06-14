import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { StorageService } from './storage.service';

/**
 * Almacenamiento de archivos (S3). Exporta `StorageService` para que otros
 * módulos (p. ej. órdenes) firmen URLs de lectura de las fotos.
 */
@Module({
  controllers: [UploadsController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
