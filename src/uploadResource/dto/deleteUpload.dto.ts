import { IsArray, IsNumber, IsString } from 'class-validator';

export class deleteUploadDto {
  @IsArray()
  @IsString({ each: true })
  keys: string[];

  @IsNumber()
  profileId: number;
}
