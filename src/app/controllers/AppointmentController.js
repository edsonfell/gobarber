import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import File from '../models/File';
import User from '../models/User';
import Notification from '../schemas/Notification';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

// ********* Listagem de agendamentos do usuário comum *********
class AppointmentController {
  async index(req, res) {
    // Recebemos da req.query o parametro da página
    // Por padrão definimos como sendo 1
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 10,
      // Em offset definimos quantos registros queremos **PULAR**, baseado na página
      // em que nos encontramos
      offset: (page - 1) * 10,
      // Abaixo estamos trazendo os dados do relacionamento com o 'provider'
      // que foi sinalizado na model dos appointments.
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          // Abaixo fazemos também o include do relacionamento
          // com a model File que foi sinalizado como 'avatar' na model User
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { provider_id, date } = req.body;

    /**
     * Checking if provider_id is a provider
     */
    const isProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    });
    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }
    if (isProvider.id === req.userId) {
      return res
        .status(401)
        .json({ error: 'You cant create appointments to your own user' });
    }

    // A função startOfHour limpa os minutos e segundos passados
    // na hora recebida. Por exemplo, se recebermos 19:30, a função
    // irá devolver 19:00
    const startHour = startOfHour(parseISO(date));

    // Chegando se a data é anterior ao horário atual
    if (isBefore(startHour, new Date())) {
      return res.status(400).json({ error: 'Past dates are note permited' });
    }

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: startHour,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({ error: 'This date is not available' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: startHour,
    });

    // Notificando o prestador
    const user = await User.findByPk(req.userId);
    const formattedDate = format(startHour, "'dia' dd 'de' MMM', às' H:mm'h'", {
      locale: pt,
    });

    // Cria novo registro na tabela Notifications do mongo
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    // O include nos permite trazer as informações do relacionamento
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).send({
        error: "You don't have permission to cancel this appointment",
      });
    }

    if (appointment.canceled_at) {
      return res.status(400).send({
        error: 'The appointment has already been canceled',
      });
    }

    // O usuário só poderá cancelar o agendamento com pelo menos 2 horas
    // de antecedência.
    // Se cancelingLimit for anterior a hora atual, não será permitido cancelar
    // Exemplo:
    // cancelingLimit: 11h00
    // now date: 11h30
    const cancelingLimit = subHours(appointment.date, 2);
    if (isBefore(cancelingLimit, new Date())) {
      return res.status(401).send({
        error: 'You can only cancel appointments 2 hours in advance',
      });
    }

    appointment.canceled_at = new Date();
    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    const formattedDate = format(
      appointment.date,
      "'dia' dd'/'MM', às' H:mm'h'",
      {
        locale: pt,
      }
    );

    // Gera uma notificação
    await Notification.create({
      content: `O usuário ${appointment.user.name} cancelou o agendamento do
     ${formattedDate}`,
      user: appointment.provider_id,
    });

    return res.json(appointment);
  }
}
export default new AppointmentController();
