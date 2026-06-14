import { randomUUID } from 'node:crypto';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageConfig } from '../config/configuration';

/**
 * Almacenamiento de archivos en AWS S3 mediante **URLs prefirmadas**: la app
 * sube la foto directamente a S3 (el backend no maneja los bytes) y luego
 * referencia la `key`. Para mostrarla se firma una URL de lectura temporal, así
 * el bucket permanece privado.
 *
 * Si no hay bucket configurado (`AWS_S3_BUCKET` vacío), el servicio queda
 * deshabilitado y la subida de fotos simplemente no está disponible.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly cfg: StorageConfig;
  private readonly client: S3Client | null;

  constructor(config: ConfigService) {
    this.cfg = config.get<StorageConfig>('storage')!;
    this.client = this.cfg.enabled
      ? new S3Client({
          region: this.cfg.region,
          // Con claves explícitas; si están vacías, AWS usa su cadena por defecto.
          credentials: this.cfg.accessKeyId
            ? { accessKeyId: this.cfg.accessKeyId, secretAccessKey: this.cfg.secretAccessKey }
            : undefined,
        })
      : null;
    if (!this.client) {
      this.logger.warn('Almacenamiento S3 deshabilitado (define AWS_S3_BUCKET para activarlo).');
    }
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  /** Genera una key única y una URL prefirmada (PUT) para subir el archivo. */
  async presignUpload(contentType: string): Promise<{ uploadUrl: string; key: string }> {
    const client = this.requireClient();
    const ext = contentType === 'image/png' ? 'png' : 'jpg';
    const key = `work-orders/${randomUUID()}.${ext}`;
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: this.cfg.bucket, Key: key, ContentType: contentType }),
      { expiresIn: 300 },
    );
    return { uploadUrl, key };
  }

  /** URL prefirmada (GET, temporal) para mostrar una foto privada. `null` si no
   *  hay key o el almacenamiento está deshabilitado. */
  async presignDownload(key: string | null): Promise<string | null> {
    if (!key || !this.client) return null;
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.cfg.bucket, Key: key }),
      { expiresIn: 3600 },
    );
  }

  private requireClient(): S3Client {
    if (!this.client) {
      throw new ServiceUnavailableException('El almacenamiento de archivos no está configurado');
    }
    return this.client;
  }
}
