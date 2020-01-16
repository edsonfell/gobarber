import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import databaseConfig from '../config/database';
import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    // Criação da conexão com a base
    this.connection = new Sequelize(databaseConfig);
    // Abaixo passamos a conexão para cada um dos models
    // que temos em nossa aplicação
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: true,
    });
  }
}
export default new Database();
