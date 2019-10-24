import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  // O parametro 'sequelize' representa
  // a conexão com a base
  static init(sequelize) {
    super.init(
      {
        // Os campos abaixo não precisam
        // ser um reflexo da nossa base
        // Campos do tipo Virtual são
        // só usados do lado do backend
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
    // Hooks são trechos de código que são executados automaticamente
    this.addHook('beforeSave', async user => {
      if (user.password) {
        // Passamos 8 como segundo parametro para o Bcrypt
        // sendo como o nível da criptografia.
        // Poderíamos usar um número maior como 100, mas
        // ficaria muito pesado e custoso.
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });
    return this;
  }

  // O método abaixo nos permite relacionar a model User
  // com a model File
  static associate(models) {
    // belongsTo significa que temos o Id de File dentro de Users.
    // Abaixo definimos isso e que isso ocorre na coluna avatar_id
    // Outro exemplo de relacionamento seria o hasOne(),
    // se tivessemos um id de usuário dentro da tabela Files
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
