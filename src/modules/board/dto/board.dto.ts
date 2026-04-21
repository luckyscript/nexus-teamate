import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PageRequestDto } from '../../../common/dto/pagination.dto';

export { PageRequestDto };

export class CreateBoardRequestDto {
  @IsString()
  name: string;

  @IsEnum(['kanban', 'list'])
  viewType: string;

  @IsOptional()
  @IsNumber()
  templateId?: number;
}

export class BoardColumnDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsNumber()
  seq: number;

  @IsOptional()
  @IsBoolean()
  isInitial?: boolean;

  @IsOptional()
  @IsBoolean()
  isTerminal?: boolean;

  @IsOptional()
  @IsNumber()
  wipLimit?: number;
}

export class UpdateBoardColumnsRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoardColumnDto)
  columns: BoardColumnDto[];
}

export class TransitionDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  fromStatusCode: string;

  @IsString()
  toStatusCode: string;

  @IsString()
  transitionType: string;

  @IsOptional()
  condition?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpdateTransitionsRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransitionDto)
  transitions: TransitionDto[];
}

export class BoardColumnVO {
  id: number;
  code: string;
  name: string;
  seq: number;
  category: string | null;
  isInitial: boolean;
  isTerminal: boolean;
  wipLimit: number | null;
}

export class TransitionVO {
  id: number;
  fromStatusCode: string;
  toStatusCode: string;
  transitionType: string;
  condition: Record<string, unknown> | null;
  isEnabled: boolean;
}

export class BoardResponseVO {
  id: number;
  projectId: number;
  name: string;
  viewType: string;
  status: string;
  config: Record<string, unknown> | null;
  columns: BoardColumnVO[];
  transitions: TransitionVO[];
  createdAt: Date;
  updatedAt: Date;
}
