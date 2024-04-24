import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt-strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy],
  imports: [

    ConfigModule,

    TypeOrmModule.forFeature([ User ]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: ( configService:ConfigService ) => {
        // console.log('JWT Secret Este viene del config service', configService.get('JWT_SECRET') ) 
        // console.log('JWT_SECRET Este viene de las variables de entorno', process.env.JWT_SECRET);
        return {
          secret: configService.get('JWT_SECRET'),// Se prefiere usar el configService para acceder a las variables de entorno ya que es mas seguro 
          signOptions: {
            expiresIn: '2h'
          }
        }
      }
    })

    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '2h'
    //   }
    // })
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule]// Exportamos el jwtstrateg para poder utilizarlo en otros modulos
})
export class AuthModule {}


//PassportModule.register({ defaultStrategy: 'jwt' })
// Con esto estamos diciendo que passport se va a encargar de la autenticacion de los usuarios y que la estrategia por defecto es jwt


//JwtModule.registerAsync
// Con esto estamos diciendo que vamos a registrar el modulo de JWT de forma asincrona, es decir, que vamos a esperar a que se resuelva la promesa que retorna la funcion useFactory
// Esta funcion se encarga de retornar un objeto con la configuracion del modulo de JWT
// La funcion useFactory recibe como parametro el ConfigService que nos permite acceder a las variables de entorno

// Paso 1. Importamos ConfigModule y ConfigService de @nestjs/config
// Paso 2. Importamos el modulo de configuracion en el imports de AuthModule
// Paso 3. Inyectamos ConfigService en el useFactory para poder acceder a las variables de entorno

//JWT Strategy
// Un JWT se compone de 3 partes: Header, Payload y Signature
// El header contiene el tipo de token y el algoritmo de encriptacion
// El payload contiene la informacion del usuario autenticado como nombre o id, etc.
// La signature es la firma que se genera con el header, el payload y el secret (una clave) que se usa para verificar que el token es valido
// Para implementar la estrategia de JWT necesitamos crear un archivo de estrategia jwt.strategy.ts

//Importamos el configModule en el auth.module.ts para poder acceder a las variables de entorno en el jwt.strategy.ts