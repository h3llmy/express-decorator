import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

export class JossQuery {
  @IsNumber()
  @IsOptional()
  name?: string;
}

export class JossBody {
  @Length(10)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  number: number;
}
