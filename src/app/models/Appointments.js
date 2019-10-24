import Sequelize, { Model } from 'sequelize';

class Appointments extends Model {
  // O parametro 'sequelize' representa
  // a conexão com a base
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    // Quando temos 2 relacionamentos com a mesma tabela,
    // o sequelize nos obriga a darmos um apelido para as chaves
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' });
  }
}

export default Appointments;
