const express = require('express');
const router = express.Router();
const Book = require('../models/book.model');

// MIDDLEWARE
const getBook = async (req, res, next) => {
  let book;
  // El id lo obtenemos de los parametros de la request
  const { id } = req.params;

  // Si el id no es uno valido de mongo (24 caracteres letras o numeros) devolvemos 404
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({
      message: 'El ID del libro no es valido',
    });
  }

  // Si es un id valido lo buscamos
  try {
    book = await Book.findById(id);

    // Validamos si el libro no existe
    if (!book) {
      return res.status(404).json({
        message: 'El libro no fue encontrado',
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }

  res.book = book;
  next();
};

// Obtener todos los libros
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    console.log('GET ALL', books);
    if (books.length === 0) {
      return res.status(204).json([]);
    }
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo libro [POST]
router.post('/', async (req, res) => {
  const { title, author, genre, publication_date } = req?.body;

  if (!title || !author || !genre || !publication_date) {
    return res.status(400).json({
      message: 'Los campos titulo, autor, genero y fecha son obligatorios',
    });
  }

  const book = new Book({
    title,
    author,
    genre,
    publication_date,
  });

  try {
    const newBook = await book.save();
    console.log(newBook);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Obtener 1 libro by ID
router.get('/:id', getBook, async (req, res) => {
  res.json(res.book);
});

// Editar un libro
router.put('/:id', getBook, async (req, res) => {
  try {
    const book = res.book;
    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.genre = req.body.genre || book.genre;
    book.publication_date = req.body.publication_date || book.publication_date;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.patch('/:id', getBook, async (req, res) => {
  if (
    !req.body.title &&
    !req.body.author &&
    !req.body.genre &&
    !req.body.publication_date
  ) {
    res.status(400).json({
      message:
        'Al menos uno de estos campos debe ser enviado: Titulo, autor, genero, fecha de publicacion',
    });
  }
  try {
    const book = res.book;
    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.genre = req.body.genre || book.genre;
    book.publication_date = req.body.publication_date || book.publication_date;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Borrar un libro
router.delete('/:id', getBook, async (req, res) => {
  try {
    const book = res.book;
    await book.deleteOne({
      _id: book._id,
    });
    res.json({
      message: `El libro ${book.title} fue eliminado correctamente`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
