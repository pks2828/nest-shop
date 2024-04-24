import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()// Con esto le decimos a nest que este servicio es inyectable y se puede utilizar en otros modulos como provider 
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        
        configService:ConfigService
    ) {

        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate( payload: JwtPayload ): Promise<User> {

        const { id } = payload;

        const user = await this.userRepository.findOneBy({ id });

        if ( !user ) 
            throw new UnauthorizedException('Token not valid')
        
        if ( !user.isActive )
            throw new UnauthorizedException('User is inactive, talk with admin')

            console.log({ userStrategy: user});

        return user; // Si se pasa el meotod de validacion, se retorna el usuario autenticado y se guarda en el objeto request.user  
    }

}

//METODO DE VALIDACION DEL PAYLOAD
//El passport strategy revisa el token que se envia en la cabecera de la peticion y lo valida con el secret que se uso para firmar el token
// Si el token es valido, se extrae la informacion del payload y se guarda en el objeto request.user
// Paso 1. Creamos el metodo validate que recibe el payload del token y retorna una promesa de tipo User (el usuario autenticado)
// Paso 2. Implementamos la logica para extraer la informacion del payload y retornarla como un usuario autenticado
// Paso 3. Creamos una interface para saber como va lucir el payload del token
// Paso 4. Anadimos el constructor con la inyeccion de dependencia del userRepository para poder buscar el usuario en la base de datos
// Paso 5. Llamamos al constructor de la clase padre
// Paso 6. Inyectamos tambien el configservice para poder acceder a las variables de entorno