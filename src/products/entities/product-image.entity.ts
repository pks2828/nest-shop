import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";


@Entity({ name: 'product_images'})
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne( // Muchas imagenes pueden tener un producto
        () => Product, //Este callback regresa la clase que crea la entidad
        (product) => product.images, //Este callback regresa la propiedad que se va a relacionar
        { onDelete: 'CASCADE' }        
    )
    product: Product



}