/**
 * routes/schemas.js
 * -----------------------------------------------------------------------
 * Serves the JSON Schema documents for the API's resources, mounted at
 * /schemas in server.js.
 *
 *   GET /schemas          -> human-readable HTML index page listing the
 *                            available schemas with links to each one.
 *   GET /schemas/book      -> the Book resource, as a JSON Schema document.
 *   GET /schemas/review    -> the Review resource, as a JSON Schema document.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { bookSchema, reviewSchema } = require('../data/schemas');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('schemas', {
    schemas: [
      { name: 'Book', path: '/schemas/book', description: 'Shape of a single book resource.' },
      { name: 'Review', path: '/schemas/review', description: 'Shape of a single review resource.' },
    ],
  });
});

router.get('/book', (req, res) => {
  res.status(200).json(bookSchema);
});

router.get('/review', (req, res) => {
  res.status(200).json(reviewSchema);
});

module.exports = router;
