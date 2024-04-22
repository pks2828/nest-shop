import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsPositive()
    
    //transformar
    @Type( () => Number)// opicional si ponieramos enableImplicitConversions:true
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type( () => Number)// opicional si ponieramos enableImplicitConversions:true
    offset?: number;

}