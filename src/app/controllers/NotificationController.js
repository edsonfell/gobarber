import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUserProvider) {
      return res.send(401).json({ error: 'User is not a provider' });
    }

    const notifications = await Notification.find({
      user: req.userId,
    })
      // Ordenando as notificações para trazer primeiro as mais recentes
      .sort({
        createdAt: 'desc',
      })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      // O parametro new é para que o mongo retorne o registro após atualizar
      { new: true }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
