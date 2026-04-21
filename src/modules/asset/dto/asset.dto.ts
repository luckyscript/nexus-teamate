import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  IsObject,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSkillRequestDto {
  @IsDefined()
  @IsString()
  skillKey: string;

  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsString()
  category: string;

  @IsOptional()
  @IsEnum(['private', 'team', 'organization'])
  visibility?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsDefined()
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateSkillRequestDto {
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  skillKey?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(['private', 'team', 'organization'])
  visibility?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateCapsuleRequestDto {
  @IsDefined()
  @IsString()
  capsuleKey: string;

  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsString()
  sceneType: string;

  @IsOptional()
  @IsEnum(['private', 'team', 'organization'])
  visibility?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsDefined()
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateCapsuleRequestDto {
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  capsuleKey?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sceneType?: string;

  @IsOptional()
  @IsEnum(['private', 'team', 'organization'])
  visibility?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateTemplateRequestDto {
  @IsDefined()
  @IsString()
  templateKey: string;

  @IsDefined()
  @IsEnum(['board', 'automation', 'agent', 'skill', 'capsule', 'project', 'scenario'])
  templateType: string;

  @IsDefined()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(['system', 'team', 'user'])
  scopeType?: string;

  @IsDefined()
  @IsObject()
  payload: Record<string, unknown>;
}

export class UpdateTemplateRequestDto {
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  templateKey?: string;

  @IsOptional()
  @IsEnum(['board', 'automation', 'agent', 'skill', 'capsule', 'project', 'scenario'])
  templateType?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['system', 'team', 'user'])
  scopeType?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

export class CreateAssetBindingRequestDto {
  @IsDefined()
  @IsEnum(['skill', 'capsule', 'template'])
  assetType: string;

  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  assetId: number;

  @IsDefined()
  @IsEnum(['agent', 'project', 'board'])
  targetType: string;

  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  targetId: number;

  @IsOptional()
  @IsEnum(['runtime_context', 'reference', 'dependency'])
  bindType?: string;
}

export class SkillVO {
  id: number;
  tenantId: number;
  skillKey: string;
  name: string;
  category: string;
  status: string;
  visibility: string;
  summary: string | null;
  content: string;
  tags: string[] | null;
  version: number;
  publishedAt: Date | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CapsuleVO {
  id: number;
  tenantId: number;
  capsuleKey: string;
  name: string;
  sceneType: string;
  status: string;
  visibility: string;
  summary: string | null;
  content: string;
  tags: string[] | null;
  version: number;
  publishedAt: Date | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class TemplateVO {
  id: number;
  tenantId: number;
  templateKey: string;
  templateType: string;
  name: string;
  scopeType: string;
  status: string;
  payload: Record<string, unknown>;
  version: number;
  publishedAt: Date | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AssetBindingVO {
  id: number;
  tenantId: number;
  assetType: string;
  assetId: number;
  targetType: string;
  targetId: number;
  bindType: string;
  createdBy: number | null;
  createdAt: Date;
}
