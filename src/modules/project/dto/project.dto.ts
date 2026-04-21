import {
  IsString,
  IsOptional,
  IsNumber,
  IsDefined,
  Length,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectRequestDto {
  @IsDefined()
  @IsString()
  @Length(1, 64)
  code: string;

  @IsDefined()
  @IsString()
  @Length(1, 128)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ownerId?: number;
}

export class UpdateProjectRequestDto {
  @IsOptional()
  @IsString()
  @Length(1, 64)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(1, 128)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ownerId?: number;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'archived'])
  status?: string;
}

export class ProjectResponseVO {
  id: number;
  tenantId: number;
  orgId: number | null;
  code: string;
  name: string;
  description: string | null;
  ownerId: number | null;
  status: string;
  configJson: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
