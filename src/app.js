import express from 'express';
import path from 'path';
import routes from './routes';
import './database';

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  // Este método será responsável
  // por cadastrar todos os middlewares da aplicação
  middlewares() {
    this.server.use(express.json());

    // Aqui definimos uma rota que irá servir arquivos estáticos
    // que podem ser acessados diretamente pelo navegador
    // Abaixo definimos a rota e a pasta. Desta forma não precisamos
    // estar autenticados para acessar as imagens
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
