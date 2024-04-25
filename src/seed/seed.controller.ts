import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}


  @Get()
  // @Auth( ValidRoles.admin)// Apply decorators 
  executeSeed(){
    return this.seedService.runSeed()
  }

}

// Para podr utilizar auth en el controlador de seed, se debe importar el modulo de auth y aplicar el decorador Auth con los roles que se desean proteger
