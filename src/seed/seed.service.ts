import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository( User )
    private readonly userRepository: Repository<User>,

  ){}

  async runSeed(){

    await this.deleteTables();
    const adminUser = await this.insertUsers();// 4. Inserto los datos de los usuarios

    await this.insertNewProducts( adminUser ); // 5. Inserto los datos de los productos con el usuario admin 

    return ('SEED EXECUTED');
  }

  private async deleteTables() { // 1. Borro los datos de las tablas
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();
  }

  private async insertUsers() { // 2. Inserto los datos de los usuarios

    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach( user => {
      users.push(this.userRepository.create(user));
    }); // Preparamos los datos para insertar en la base de datos

    const dbUsers = await this.userRepository.save( seedUsers ); // Guardamos los datos en la base de datos

    return dbUsers[0]; // 3. Regresamos el primer usuario
    //! Si lo dejabamos como users regresaba un usuario sin id
    
  }


  private async insertNewProducts( user: User ) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push(this.productsService.create(product, user));
    });

    await Promise.all(insertPromises);

    return true;
  }

}

//PASO PARA TRAER FUNCION DEL SERIVCIO DE PRODUCTO
// 1. Exportar products service y typeorm en el modulo de productos
// 2. Importar products module en el modulo de seed
// 3. Importar products service en el servicio de seed
// 4. Inyectar products service en el constructor del servicio de seed
// 5. Llamar funcion del servicio de productos en el servicio de seed

