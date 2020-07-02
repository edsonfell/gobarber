import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
import path from 'path';
import cors from 'cors';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import sentryConfig from './config/sentry';
import routes from './routes';
import './database';

class App {
  constructor() {
    this.server = express();
    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  // Este método será responsável
  // por cadastrar todos os middlewares da aplicação
  middlewares() {
    // Middleware do Sentry para verificações de erros na API
    this.server.use(Sentry.Handlers.requestHandler());
    // A configuração abaixo do CORS define qual endereço externo poderá acessar
    // nossas rotas. Para ambiente dev deixamos em branco.
    // this.server.use(cors({ origin: 'https://rocketseat.com.br' }));
    this.server.use(cors());
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
    this.server.use(Sentry.Handlers.errorHandler());
  }

  // Um middleware de tratamento de erro, recebe, além dos
  // parametros padrões (req, res, next), um parametro com o erro
  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json(errors);
      }
      return res.status(500).send({ error: 'Internal server error' });
    });
  }
}

export default new App().server;
