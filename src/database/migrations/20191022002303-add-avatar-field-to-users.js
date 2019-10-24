module.exports = {
  up: (queryInterface, Sequelize) => {
    // Abaixo definimos a tabela que será alterada (users)
    // e a coluna que será adicionada (avatar_id)
    return queryInterface.addColumn('users', 'avatar_id', {
      // Abaixo definimos o tipo do campo
      type: Sequelize.INTEGER,
      // Abaixo estamos definindo o relacionamento com a tabela Files
      references: { model: 'files', key: 'id' },
      // Abaixo definimos o comportamento caso o registro seja deletado
      // da tabela usuario.
      // Caso update: Cascata. A alteração também ocorrerá na tabela de usuarios
      // Caso delete: Deixamos como null
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'avatar_id');
  },
};
