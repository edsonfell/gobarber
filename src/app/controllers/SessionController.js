// O import do yup é feito dessa maneira
// pois ele não possui um export default
import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import File from '../models/File';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).send({ error: 'Data validation fails' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!user) {
      // 401 - Not Authorized
      return res.status(401).send({ error: 'User not found' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).send({ error: 'Wrong Password.' });
    }

    // Após consistir a senha acima, iremos retornar
    // as info do usuário e o token
    const { id, name, avatar, provider } = user;
    return res.json({
      user: {
        id,
        name,
        email,
        provider,
        avatar,
      },
      // Abaixo estamos passando as informações que serão
      // enviadas junto ao payload do token.
      // Enviamos também uma privateKey que é o nosso Hash MD5
      // Abaixo definimos o tempo de validade do token (7 dias)
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
