import { Body, Controller, Post } from '@nestjs/common';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { StorageService } from './storage.service';

/**
 * Entrega URLs prefirmadas para que la app suba fotos directamente a S3.
 * Flujo: la app pide aquí una URL → hace PUT del archivo a esa URL → envía la
 * `key` resultante al crear la orden.
 */
@Controller('uploads')
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Post('presign')
  async presign(@Body() dto: PresignUploadDto): Promise<{ uploadUrl: string; key: string }> {
    return this.storage.presignUpload(dto.contentType);
  }
}
