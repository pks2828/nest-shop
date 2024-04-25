import { Controller, Post, Body, Get, UseGuards, Req} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { Auth, GetUser, RawHeaders, RoleProtected } from './decorators';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';



@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  LoginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus(user);
  }
  

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail:string,

    @RawHeaders() rawHeaders: string[],
    // @Headers()
  ){
    // console.log(request);
    // console.log({userReq: request.user});
    // console.log({user});
    return {
      ok: true,
      message: 'Esta es una ruta privada',
      user,
      userEmail,
      rawHeaders
    };
  }

  @Get('private2')
  @RoleProtected( ValidRoles.superUser, ValidRoles.user, ValidRoles.admin )
  // @SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards( AuthGuard(), UserRoleGuard )// AuthGuard() = Autentiacion, UserRoleGuard = Autorizacion
  privateRoute2(
    @GetUser() user: User,
  ){
    return {
      ok: true,
      message: 'Esta es una ruta privada2',
      user
    };
  }

  @Get('private3')
  // Con esto solo se podra acceder a la ruta privada3 con un token valido y con un rol de admin o superUser
  @Auth( ValidRoles.admin, ValidRoles.superUser )// Apply decorators 
  // Con esto solo se podra acceder a la ruta privada3 con un token valido
  // @Auth()
  privateRoute3(
    @GetUser() user: User,
  ){
    return {
      ok: true,
      message: 'Esta es una ruta privada3',
      user
    };
  }

  

}


//controlador login
// Paso 1. Creamos el modelo dto para el login
// Paso 2. Creamos el metodo login en el service

//Controlador testingPrivateRouter
// Con este controlador vamos a probar que la ruta privada solo se pueda acceder con un token valido y que el token se genere correctamente en el login
// Paso 1. Creamos el controlador 
// Paso 2. Creamos el metodo testingPrivateRoute en el controlador y lo retornamos como json para ver que funciona
// Paso 3. Implementaremos un Guard en la ruta privada para que solo se pueda acceder con un token valido 
// Paso 4. Importamos el guard en el controlador
// Paso 5. Usamos el decorador UseGuards en el metodo testingPrivateRoute para proteger la ruta privada
// Paso 6. Enviamos como parametro el AuthGuard en el decorador UseGuards para proteger la ruta privada 
// Paso 7. Probamos la ruta privada con un token valido y con un token invalido

// Custom Property Decorator
// Paso 1. Vemos la req en el metodo testingPrivateRoute y vemos que el token se encuentra en req.headers.authorization 
// Paso 2. Creamos un decorador personalizado para obtener el usuario autenticado en la ruta privada
// Paso 3. Creamos el decorador GetUser en el archivo ger-user.decorator.ts 
