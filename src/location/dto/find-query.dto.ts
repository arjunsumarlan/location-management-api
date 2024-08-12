import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class FindOneQuery {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeChildren?: boolean;
}
