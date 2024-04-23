import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';

import { validate as isUUID } from "uuid";
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ){}

  async create(createProductDto: CreateProductDto) {

    try {
      const { images = [], ...productDetails } = createProductDto; // aqui es rest

      const product = this.productRepository.create({
        ...productDetails, // Aqui es spread, se crea una copia de productDetails
        images: images.map( image => this.productImageRepository.create({ url: image }) ), // Dentro del producto se crea un arreglo de imagenes
      }); // Crear una instancia de la entidad

      await this.productRepository.save(product); // Guardar en la base de datos
      
      //return product;

      return { ...product, images }; // Aqui es spread, se crea una copia de product y se le agrega el arreglo de imagenes
      
    } catch (error) {
      this.handleDBException(error)
    }
    

  }

  async findAll( paginationDto:PaginationDto ) {

    const { limit = 10, offset = 0 } = paginationDto // inicializamos limit y offset en caso de que no vengan en el objeto

    const products = await this.productRepository.find({ // Regresa la coleccion y los almacena en products
      take: limit,
      skip: offset,
      //TODO Relaciones
      relations: {
        images: true
      }
    });

    return products.map( product => ({ // Mapeamos los productos para que solo regrese el url de las imagenes
      ...product, // Aqui es spread, se crea una copia de product
      images: product.images.map( img => img.url )// Aqui es map, se recorre el arreglo de imagenes y se regresa solo el url
      //! con esto aplanamos el objeto y solo regresamos el url de las imagenes
    }));

    //! SEGUNDA MANERA
    // return products.map( ({ images, ...rest }) => ({
    //   ...rest,
    //   images: images.map( img => img.url )
    //}))
    //! RECORDAR QUE TODO ESTO VIENE DE LA CLASE PRODUCT QUE TIENE UNA RELACION CON LA CLASE PRODUCTIMAGE
    //! DESESTRUCTURAMOS LA PROPIEDAD DEL OBJETO PRODUCT QUE ES IMAGES Y LUEGO LA RECORREMOS PARA OBTENER EL URL DE CADA IMAGEN
    //! LUEGO DEVOLVEMOS UN NUEVO OBJETO CON LAS PROPIEDADES RESTANTES Y LA PROPIEDAD IMAGES CON EL URL DE CADA IMAGEN
  }

  async findOne( term: string) {

    let product:Product;

    if ( isUUID(term) ){
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();      
    }
    
    if ( !product ) {
      throw new BadRequestException(`Product with id ${term} not found`)
    }
    return product;
  }

  async findOnePlain( term: string ){ //! METODO PARA APLANAR Y EXPLICACION DEL POR QUE SE HACE EN EL VIDEO 147 MINUTO 12 DE NEST FERNANDO
    const { images = [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map( image => image.url)
    }
  }

  // En este scope se hacen 3 consultas a la base de datos, una para buscar el producto, otra para borrar las imagenes y otra para guardar las nuevas imagenes.
  async update(id: string, updateProductDto: UpdateProductDto) { 

    const { images, ...toUpdate } = updateProductDto;

    //! Busca un producto por id y lo carga con los datos de updateProductDto
    const product = await this.productRepository.preload({ id, ...toUpdate });

    if ( !product ) {throw new NotFoundException(`Product with id ${id} not found`) }

    //TODO: Create query runner // Se crea un queryRunner para poder hacer transacciones
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    
    try {

      if ( images ) { //! Tener mucho cuidado por que se puede borrar todas las imagenes de un producto
        await queryRunner.manager.delete( ProductImage, { product: { id } }) //Borrara todas las productImage cuya columna productId sea igual al id del producto

        product.images = images.map(
           image => this.productImageRepository.create({ url: image }) 
        )
      } else {

      }
      
      await queryRunner.manager.save(product);// Guardar en la base de datos el producto actualizado
      // await this.productRepository.save(product);// En este punto ya se ha cargado el producto con los datos de updateProductDto

      await queryRunner.commitTransaction(); // Commit de la transaccion
      await queryRunner.release(); // Liberar el queryRunner

      return this.findOnePlain(id);  // Guardar en la base de datos
      
    } catch (error) {  

      await queryRunner.rollbackTransaction(); // Rollback de la transaccion
      await queryRunner.release(); // Liberar el queryRunner

      this.handleDBException(error)
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)

  }


  private handleDBException(error: any) {

    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }

    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, ckeck the logs for more information')
  }

  async deleteAllProducts(){ // Metodo para borrar todos los productos de la base de datos SOLO DEV
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
      .delete()
      .where({})
      .execute();

    } catch (error) {
      this.handleDBException(error);
    }

  }

}

