import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './product-image.entity';
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: '336ff1bd-f0d4-44f1-8e22-e2f1f4b36721',
        description: 'The id of the product',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @ApiProperty({
        example: 'Teslo shop',
        description: 'Product title',
        uniqueItems: true,
    })
    @Column('text',{
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product Price',
    })
    @Column('float',{
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Lorem ipsum',
        description: 'Product description',
        default: null,
    })
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty({
        example: 'T_Shirt_Teslo',
        description: 'Product SLUG - for SEO',
        uniqueItems: true,
    })
    @Column('text',{
        unique: true,
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product Stock',
        default: 0,
    })
    @Column('int',{
        default: 0,
    })
    stock: number;

    @ApiProperty({
        example: ['S','M','L','XL'],
        description: 'Product sizes',
    })
    @Column('text',{
        array: true,
        nullable: true,
    })
    sizes: string[];

    @ApiProperty({
        example: ['Men', 'Female'],
        description: 'Product Gender'
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['T-Shirt', 'Pants', 'Shoes'],
        description: 'Product Tags',
    })
    @Column('text',{
        array: true,
        nullable: true,
        default: '{}'
    })
    tags: string[];

    // images
    @ApiProperty({
        example: '336ff1bd-f0d4-44f1-8e22-e2f1f4b36721.jpg',
        description: ' The id of the product image',
        uniqueItems: true,
    })
    @OneToMany(// un producto puede tener muchas imagenes
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }//El eager es para que traiga las imagenes cuando se traiga el producto por busqueda id 
        //! OJO, slock y title no se puede usar eager por que es un query builder para eso se utiliza LEFTJOINANDSELECT
    )
    images?: ProductImage[]; // Arreglo de imagenes que pertenecen a este producto

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User

    @BeforeInsert()
    checkSlugInsert(){
        
        if ( !this.slug ){
            this.slug = this.title
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }


}

// Definimos relacion de muchos a uno con el usuario que lo creo y con las imagenes que tiene