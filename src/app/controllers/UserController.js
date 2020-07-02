// O import do yup é feito dessa maneira
// pois ele não possui um export default
import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    // Abaixo usamos o Yup pra verificar
    // se os dados recebidos estão
    // no schema definido
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Data validation failed' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (!userExists) {
      const { id, name, email, provider } = await User.create(req.body);
      return res.json({
        id,
        name,
        email,
        provider,
      });
    }
    return res.status(400).send({ error: 'User already exist.' });
  }

  async update(req, res) {
    // Abaixo usamos o Yup pra verificar
    // se os dados recebidos estão
    // no schema definido
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      // Abaixo colocamos que o campo password
      // é obrigatório caso o oldPassword esteja preenchido
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Data validation fails' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    // Verificando se o e-mail passado é diferente do cadastrado.
    // Caso seja, é pq o usuário quer alterar o e-mail
    if (email !== user.email) {
      const userExists = await User.findOne({
        where: { email: req.body.email },
      });

      if (userExists) {
        return res.status(400).send({ error: 'Email already used.' });
      }
    }
    // Caso oldPassword esteja preenchida, verificamos se ela é válida
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).send({ error: 'Wrong Password' });
    }

    await user.update(req.body);
    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new UserController();
