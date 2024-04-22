import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from "uuid";

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>

  ){}

  async create(createProductDto: CreateProductDto) {

    try {

      const product = this.productRepository.create(createProductDto); // Crear una instancia de la entidad
      await this.productRepository.save(product); // Guardar en la base de datos
      
      return product; // Retornar los datos guardados
      
    } catch (error) {
      
      this.handleDBException(error)
     
    }
    

  }

  findAll( paginationDto:PaginationDto ) {

    const { limit = 10, offset = 0 } = paginationDto // inicializamos limit y offset en caso de que no vengan en el objeto

    return this.productRepository.find({
      take: limit,
      skip: offset
      //TODO Relaciones
    });
  }

  async findOne( term: string) {

    let product:Product;

    if ( isUUID(term) ){
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        }).getOne();      
    }
    
    if ( !product ) {
      throw new BadRequestException(`Product with id ${term} not found`)
    }
    return product;
    
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({ //! Busca un producto por id y lo carga con los datos de updateProductDto
      id: id,
      ...updateProductDto
    });

    if ( !product ) {throw new NotFoundException(`Product with id ${id} not found`) }
    
    try {
      await this.productRepository.save(product);// En este punto ya se ha cargado el producto con los datos de updateProductDto
      return product;  // Guardar en la base de datos
      
    } catch (error) {  
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

}

