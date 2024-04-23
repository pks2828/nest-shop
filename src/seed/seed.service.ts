import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';


@Injectable()
export class SeedService {

  constructor(

    private readonly productsService: ProductsService,

  ){}

  async runSeed(){

    await this.insertNewProducts();

    return ('SEED EXECUTED');
  }

  private async insertNewProducts() {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push(this.productsService.create(product));
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

