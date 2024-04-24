import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity( 'users' )
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique: true,
    })
    email: string;

    @Column('text',{
        select: false,
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool',{
        default: true,
    })
    isActive: boolean;

    @Column('text',{
        array: true,
        default: ['user']    
    })
    roles: string[];

    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert();
    }
}
//El objetivo de la entidad es representar la estructura de la tabla en la base de datos
// Paso 1. Definir la entidad, o sea la estructura de la tabla en la base de datos
// Paso 2. Importar typorm en el modulo auth
// Paso 3. exportar el modulo de type en el modulo auth
// Paso 4. ir al controlador y comprobar el post
// Paso 5. ir al dto y definir la estructura de los datos que se van a recibir del frontend
// Paso 6. ir al controlador y comprobar el post
// Paso 7. ir al servicio y comprobar el metodo createUserDto de userService
// Paso 8. ir al controlador y comprobar el post con un usuario creado por el service</user>
// Paso 9. En el password de la entidad definimos select: false para que no se muestre en las consultas en login

//@BeforeInsert()
// Este decorador se ejecuta antes de insertar un registro en la base de datos
// Paso 1. Definimos un metodo checkFieldsBeforeInsert que se ejecuta antes de insertar un registro en la base de datos
// Paso 2. Convertimos el email en minusculas y eliminamos los espacios en blanco
//@BeforeUpdate()
// Este decorador se ejecuta antes de actualizar un registro en la base de datos
// Paso 1. Con el metodo creado anteriormente en el beforeinsert lo llamamos en el beforeupdate para que se ejecute antes de actualizar un registro en la base de datos

