import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";

export class JossBody {
  @IsNotEmpty()
  @Length(10)
  @IsString()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  number: number;
}
