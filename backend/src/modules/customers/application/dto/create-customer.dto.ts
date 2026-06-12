import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @Length(1, 150)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  documento?: string;
}
