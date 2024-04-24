import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from "bcrypt";

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)//inyeccion de dependencia de la entidad User a traves del repositorio que se encarga de las operaciones de la base de datos
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService
  ){}

  async create(createUserDto: CreateUserDto) {
    
    try {

      const { password, ...userData } = createUserDto;

      // const user = this.userRepository.create( createUserDto );
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10 )
      });

      await this.userRepository.save( user );
      delete user.password;
      
      // TODO: Retornar el JWT de acceso
      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };


    } catch (error) {
      // console.log(error, 'Error in creating user');
      this.handleDBErrors(error);
    }

  }

  async login( loginUserDto:LoginUserDto ) {

    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: { email },
      select: { email: true, password: true, id: true} 
    });

    if ( !user ) 
      throw new UnauthorizedException('Invalid credentials (email)')

    if ( !bcrypt.compareSync( password, user.password ) )
      throw new UnauthorizedException('Invalid credentials (password)')

    console.log({user});

    //TODO: Retornar el JWT de acceso
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  private getJwtToken( payload: JwtPayload ){

    const token = this.jwtService.sign( payload );
    return token;

  }

  private handleDBErrors( error: any ): never {

    if ( error.code === '23505' ) 
      throw new BadRequestException(error.detail);

    console.log(error); 

    throw new InternalServerErrorException('Pleas check server logs');

  }

}

//Metodo crear usuario
// Paso 1. Para usar la entidad es necesario hacer una inyeccion de dependencia en el cosntructor 
// Paso 2. Definir un try catch para capturar errores en el metodo create 
// Paso 3. crear constante user que recibe el metodo create de userRepository y le pasamos el createUserDto como parametro
// Paso 4. Guardamos el usuario en la base de datos con el metodo save de userRepository
// Paso 5. Convertimos el metodo create en asincrono ya que el metodo save es asincrono 
// Paso 6. Retornamos el usuario creado
// Paso 7. Creamos un metodo privado handleDBErrors que recibe un error y retorna un never, esto quiere decir que nunca va a salir de la funcion
// Paso 8. Comprobamos el metodo llamandolo en el catch del metodo create y lanzando una excepcion personalizada


// Metodo handleDBErrors
// Paso 1. Comprobamos si el error es de tipo 23505 que es un error de duplicidad de datos
// Paso 2. Lanzamos una excepcion personalizada con el mensaje del error
// Paso 3. Si no es un error de duplicidad lanzamos una excepcion de error interno del servidor y mostramos los errores por consola
// Paso 4. Lanzamos una excepcion personalizada con un mensaje de error interno del servidor
// Paso 5. Comprobamos el metodo llamandolo en el catch del metodo create y lanzando una excepcion personalizada

//Metodo para encriptar la contraseña
// Paso 1. Instalamos bcrypt
// Paso 2. Instalamos @types/bcrypt 
// Paso 3. Importamos hashSync de bcrypt o as bcrypt
// Paso 4. Dentro del metodo create desestructuramos el password del createUserDto y hacemos el metodo spread en userdata
// Paso 5. En la constante user hacemos un spread de userdata y le pasamos el password encriptado con bcrypt.hashSync
// Paso 6. Comprobamos que el password este encriptado en la base de datos

// Metodo login
// Paso 1. Creamos el metodo login en el servicio y le pasamos LoginUserDto como parametro
// Paso 2. Desestructuramos el email y password del loginUserDto
// Paso 3. Buscamos el usuario por email y password en la base de datos y almacenamos el resultado en la constante user
// Paso 4. Manejamos el caso en que el usuario no exista en la base de datos
// Paso 5. Comprobamos que la contraseña sea correcta en base a la contraseña encriptada en la base de datos
// Paso 6. Retornamos el usuario

//Instalamos passport y passport-jwt
// Paso 1. Instalamos passport y passport-jwt
// Paso 2. Importamos PassportModule en el modulo auth.module.ts
// Paso 3. ver si se va utilizar jwtModule.register o jwtModule.registerAsync
// Paso 4. Configurar el jwtModule.register con el secret y el tiempo de expiracion del token

//Implementar la estrategia de autenticacion por JWT
// Paso 1. Crearemos un metodo privado getJwtToken que recibe un payload de tipo JwtPayload y retorna un token JWT
// Paso 2. Inyectamos el servicio de JWT en el constructor del servicio de autenticacion
// Paso 3. Creamos una constante token que recibe el token generado por el metodo sign del servicio de JWT y le enviamos como parametro el payload
// Paso 4. Retornamos el token
// Paso 5. En el metodo login retornaeremos la propagacion del usuario y el token generado por el metodo getJwtToken.
//  Se tiene que pasar como un objeto con el email del usuario ya que es el unico dato que se necesita para el payload del token
// Paso 6. Probamos el endpoint de login en postman y verificamos que el token se genere correctamente