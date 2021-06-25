// Initialisation du serveur
const express = require('express');

const app = express();

const cors = require('cors');

app.use(cors());

// Paramètre du serveur
const PORT = 3001;
app.use(express.json());

const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'tutorat',
  },
});

async function initDB() {
  const tableExists = await db.schema.hasTable('todos');

  if (!tableExists) {
    await db.schema.createTable('todos', (table) => {
      table.increments('id').primary();
      table.string('description').notNullable();
      table.boolean('done').notNullable().defaultTo(false);
    });

    console.log('Created table for first time');
  } else {
    console.log('Table exists, not creating again.');
  }
}

// Définition des routes
app.get('/api/todos', async (request, response) => {
  response.json(await db('todos'));
});

app.get('/api/todos/:id', async (request, response) => {
  const id = Number(request.params.id);
  const todo = await db('todos').where('id', id).first();

  if (todo) {
    response.json(todo);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/todos/:id', async (request, response) => {
  const id = Number(request.params.id);
  await db('todos').where('id', id).del();

  response.status(204).end();
});

app.post('/api/todos', async (request, response) => {
  const { body: { description } } = request;

  if (!description) {
    return response.status(400).json({
      error: "Content missing 'description'",
    });
  }

  const rows = await db('todos')
    .insert({ description }, ['id', 'description', 'done']);

  return response.json(rows[0]);
});

app.put('/api/todos/:id', async (request, response) => {
  console.log(request.params.id);

  const id = Number(request.params.id);

  const { body: { description, done } } = request;

  console.log(done);

  if (!description && done === undefined) {
    return response.status(400).json({
      error: 'Content missing',
    });
  }

  const rows = await db('todos')
    .where('id', id)
    .update({ description, done }, ['id', 'description', 'done']);

  console.log(rows[0]);
  return response.json(rows[0]);
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Trying to initialise database');
  initDB();
});
