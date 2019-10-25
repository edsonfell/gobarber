// Este arquivo é responsável por executar a nossa fila de forma
// separada da nossa aplicação.
// Para executar a fila, criamos um novo comando no package.json
import 'dotenv/config';
import Queue from './lib/Queue';

Queue.processQueue();
