import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @ApiProperty({
        default: 10,
        description: 'Cantidad de elementos a mostrar por pagina',
        minimum: 1,
        maximum: 100,
        required: false
    })
    @IsOptional()
    @IsPositive()
    
    //transformar
    @ApiProperty({
        default: 0,
        description: 'cuantos elementos quieres saltarte',
    })
    @Type( () => Number)// opicional si ponieramos enableImplicitConversions:true
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type( () => Number)// opicional si ponieramos enableImplicitConversions:true
    offset?: number;

}