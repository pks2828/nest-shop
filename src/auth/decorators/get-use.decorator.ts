import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";



export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        // console.log({data});
        // console.log({ctx});

        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if (!user) throw new InternalServerErrorException('User not found (request)');

        return ( !data )
            ? user
            : user[data];
    }


);


//Creacion de un decorador personalizado para obtener el usuario autenticado en la ruta privada
// Paso 1. Creamos el decorador personalizado GetUser en el archivo ger-user.decorator.ts
// Paso 2. Importamos los modulos necesarios para crear el decorador personalizado
// Paso 3. Creamos el decorador GetUser con el metodo createParamDecorator
// Paso 4. Implementamos el metodo createParamDecorator con una funcion que recibe data y ctx como parametros
// Paso 5. Usamos la funcion switchToHttp() en ctx para obtener la req del request actual
// Paso 6. Obtenemos el usuario autenticado en la req del request actual con req.user
// Paso 7. Si el usuario no existe lanzamos una excepcion con un mensaje de error interno del servidor
// Paso 8. Retornamos el usuario autenticado en la ruta privada
// Paso 9. Importamos el decorador GetUser en el controlador auth.controller.ts donde queremos utilizarlo
// Paso 10. Usamos el decorador GetUser en el metodo testingPrivateRoute para obtener el usuario autenticado en la ruta privada
// Paso 11. Probamos la ruta privada con un token valido y con un token invalido
