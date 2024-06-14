const express = require('express');
const { config } = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
config();

const bookRoutes = require('./routes/book.routes');

// Usamos expres para los middlewares
const app = express();
app.use(bodyParser.json()); // Parseador de bodies

// Aca conectamos la base de datos
mongoose.connect(process.env.MONGO_URL, { dbName: process.env.MONGO_DB_NAME });
const db = mongoose.connection;

// Usamos unicamente /books
app.use('/books', bookRoutes);

const port = process.env.PORT || 3005;

app.listen(port, () => {
  console.log(`servidor corriendo en el ${port}`);
});
