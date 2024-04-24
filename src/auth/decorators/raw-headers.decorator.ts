import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const RawHeaders = createParamDecorator (
    ( data:string, ctx: ExecutionContext ) => {
        // console.log({data});
        // console.log({ctx});

        const req = ctx.switchToHttp().getRequest();
        const headers = req.rawHeaders;

     if (!headers) throw new InternalServerErrorException('headers not found (request)');   

        return headers;

    }
)
