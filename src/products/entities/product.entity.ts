import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './product-image.entity';

@Entity({ name: 'products' })
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column('text',{
        unique: true,
    })
    title: string;

    @Column('float',{
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @Column('text',{
        unique: true,
    })
    slug: string;

    @Column('int',{
        default: 0,
    })
    stock: number;

    @Column('text',{
        array: true,
        nullable: true,
    })
    sizes: string[];

    @Column('text')
    gender: string;

    @Column('text',{
        array: true,
        nullable: true,
        default: '{}'
    })
    tags: string[];

    // images
    @OneToMany(// un producto puede tener muchas imagenes
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }//El eager es para que traiga las imagenes cuando se traiga el producto por busqueda id 
        //! OJO, slock y title no se puede usar eager por que es un query builder para eso se utiliza LEFTJOINANDSELECT
    )
    images?: ProductImage[]; // Arreglo de imagenes que pertenecen a este producto


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
