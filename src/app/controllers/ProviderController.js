import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    const providers = await User.findAll({
      where: { provider: true },
      // Aqui definimos as informações que queremos retornar
      attributes: ['id', 'name', 'email', 'avatar_id'],
      // Aqui estamos trazendo tambem as informações de File
      // que são relacionadas com a tabela de usuários
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    return res.json(providers);
  }
}
export default new ProviderController();
