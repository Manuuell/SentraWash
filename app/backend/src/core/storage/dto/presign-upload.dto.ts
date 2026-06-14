import { IsIn, IsString } from 'class-validator';

export class PresignUploadDto {
  /** Tipo de la imagen a subir. Solo se permiten fotos JPEG/PNG. */
  @IsString()
  @IsIn(['image/jpeg', 'image/png'])
  contentType!: string;
}
