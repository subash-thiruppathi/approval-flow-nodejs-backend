const mysql = require('mysql2/promise');

const waitForDb = async () => {
  const MAX_TRIES = 20;
  let attempts = 0;

  while (attempts < MAX_TRIES) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS
      });
      await connection.end();
      console.log('MySQL is ready!');
      return;
    } catch (err) {
      attempts++;
      console.log(`Waiting for MySQL... (${attempts}/${MAX_TRIES})`);
      await new Promise(res => setTimeout(res, 3000));
    }
  }

  throw new Error('MySQL did not become ready in time');
};

waitForDb().then(() => require('./src/server')).catch(err => {
  console.error(err);
  process.exit(1);
});
