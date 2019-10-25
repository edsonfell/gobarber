import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';
import redisConfig from '../config/redis';

const jobs = [CancellationMail];

// Para cada um dos 'jobs' nós criamos uma fila e dentro
// dela armazenamos o 'bee' que tem a conexão com Redis
// e o handle que processa os dados;

class Queue {
  // Criaremos um fila para cada tipo de background job
  // Por exemplo, uma para e-mails de recuperação de senha,
  // outra para envio de notificação e etc;
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    // Desestruturação de cada um dos elementos de Jobs para pegar direto
    // os atributos
    jobs.forEach(({ key, handle }) => {
      // Abaixo estamos armazenando a nossa fila que tem a conexao com o Redis
      // e passamos o handle que é responsável por fazer o processamento em
      // background do job em questão
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  // Função para adicionar jobs na fila
  // queue: a qual fila o job será adicionado
  // job: o job em si
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      // 'bee' é a fila
      const { bee, handle } = this.queues[job.key];
      // bee.on('failed') 'escuta' o evento de falha ao executar o handle
      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
