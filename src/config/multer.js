import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  // Aqui configuramos o multer para que ele guarde arquivos
  // na propria aplicação.
  // Porém existem serviços específicos para armezenar
  // arquivos físicos, como o Amazon S3 e o Digital Ocean Spaces
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      // 16 é o número de bites que queremos gerar
      crypto.randomBytes(16, (err, res) => {
        // Caso dê algum erro, nós o retornamos
        if (err) return cb(err);
        // Aqui convertemos os 16 bites para hexadecimal e concatenamos
        // com a extensão do arquivo;
        // O nome do arquivo será algo assim: u11u3g71381j.png
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
