const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'reactive_resume',
  password: 'reactive_resume_2024',
  database: 'reactive_resume',
});

client.connect()
  .then(() => {
    console.log(' Connection successful with node-postgres!');
    return client.query('SELECT current_database(), current_user');
  })
  .then(result => {
    console.log('Result:', result.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error(' Connection failed:', err.message);
    client.end();
  });
