export default {
  // Non-MD5 secret: hashgobarbermd5
  // https://www.md5online.org/
  secret: process.env.APP_SECRET,
  expiresIn: '7d',
};
