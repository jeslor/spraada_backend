import { PartialType } from '@nestjs/mapped-types';
import { CreateToolDto } from './create-tool.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateToolDto extends PartialType(CreateToolDto) {
  @IsBoolean()
  @IsOptional()
  available?: boolean;
}
