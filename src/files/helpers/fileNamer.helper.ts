import { v4 as uuid } from "uuid";

// eslint-disable-next-line @typescript-eslint/ban-types
export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function ) => {

    // console.log({ file });
    if ( !file ) return callback( new Error('No files were uploaded.'), false);

    const fileExtension = file.mimetype.split('/')[1];

    const fileName = `${ uuid() }.${ fileExtension }`;

    callback(null, fileName)

}