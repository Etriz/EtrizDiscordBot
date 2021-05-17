const { Client } = require('pg');
const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

const defaultSelect = async () => {
  const res = await client.query('SELECT name FROM commands');
  const nameArray = [];
  res.rows.forEach((item) => nameArray.push(item.name));
  // console.log(nameArray);
  return nameArray;
};

const getCommandData = async (commandName) => {
  const sql = `SELECT data FROM commands WHERE name = $1`;
  const values = [commandName];

  const res = await client.query(sql, values);
  const data = await res.rows[0].data;
  // client.end();
  return await data;
};

const setNext = async (data) => {
  const sql = `UPDATE commands SET data=$1 WHERE name='next' RETURNING data`;
  const values = [data.toString()];

  const res = await client.query(sql, values);
  const newData = await res.rows[0].data;
  // client.end();
  return await newData;
};
const addNewCommand = async (commandName, details) => {
  const sql = 'INSERT INTO commands VALUES(DEFAULT,$1,$2)';
  const values = [commandName, details];

  const res = await client.query(sql, values);
  const newData = await res.rows[0].data;
  return await newData;
};

module.exports = {
  defaultSelect,
  getCommandData,
  setNext,
  addNewCommand,
};
