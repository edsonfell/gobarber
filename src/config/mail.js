export default {
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '228d70a90477ab',
    pass: '9662b2b0726df1',
  },
  default: {
    from: 'GoBarber <noreply@gobarber.com>',
  },
};
// Existem diversos serviços para envio de e-mail,
// mas iremos utilizar o Mailtrap que só serve para ambiente
// de desenvolviment.
//  https://mailtrap.io/
