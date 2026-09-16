/**
 * routes/booksApi.js
 * -----------------------------------------------------------------------
 * The REST API for the Books Store, mounted at /api/books in server.js.
 * Every response is JSON. This router is used by:
 *   - The SSR pages (routes/pages.js calls the data module directly, but
 *     conceptually represents the same resource)
 *   - The AJAX-driven "game" (public/js/game.js) via fetch()
 *
 * Endpoints:
 *   GET    /api/books                -> list books (supports query params)
 *   GET    /api/books/:id            -> get a single book (route param)
 *   POST   /api/books                -> create a book (request body)
 *   PUT    /api/books/:id            -> replace a book (route param + body)
 *   PATCH  /api/books/:id            -> partial update (route param + body)
 *   DELETE /api/books/:id            -> delete a book (route param)
 *   GET    /api/books/:id/reviews    -> list reviews (route param + query)
 *   POST   /api/books/:id/reviews    -> add a review (route param + body)
 * -----------------------------------------------------------------------
 */

const express = require('express');
const books = require('../data/books');
const { validateFullBook, validatePartialBook, validateReview } = require('../middleware/validateBook');

const router = express.Router();

// GET /api/books?category=&search=&minPrice=&maxPrice=&sort=
router.get('/', (req, res) => {
  const { category, search, minPrice, maxPrice, sort } = req.query;
  const result = books.getAllBooks({ category, search, minPrice, maxPrice, sort });
  res.status(200).json({ count: result.length, books: result });
});

// POST /api/books  (body: title, author, category, price, [year], [stock])
router.post('/', validateFullBook, (req, res) => {
  const created = books.createBook(req.body);
  res.status(201).json(created);
});

// GET /api/books/:id
router.get('/:id', (req, res) => {
  const book = books.getBookById(req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Not found', message: `No book with id ${req.params.id}` });
  }
  res.status(200).json(book);
});

// PUT /api/books/:id  (full replace, body must contain all required fields)
router.put('/:id', validateFullBook, (req, res) => {
  const updated = books.replaceBook(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Not found', message: `No book with id ${req.params.id}` });
  }
  res.status(200).json(updated);
});

// PATCH /api/books/:id  (partial update)
router.patch('/:id', validatePartialBook, (req, res) => {
  const updated = books.updateBook(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Not found', message: `No book with id ${req.params.id}` });
  }
  res.status(200).json(updated);
});

// DELETE /api/books/:id
router.delete('/:id', (req, res) => {
  const removed = books.deleteBook(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Not found', message: `No book with id ${req.params.id}` });
  }
  res.status(200).json({ message: 'Book deleted', book: removed });
});

// GET /api/books/:id/reviews?minRating=&sort=
router.get('/:id/reviews', (req, res) => {
  const book = books.getBookById(req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Not found', message: `No book with id ${req.params.id}` });
  }
  const { minRating, sort } = req.query;
  const result = books.getReviewsForBook(req.params.id, { minRating, sort });
  res.status(200).json({ count: result.length, reviews: result });
});

// POST /api/books/:id/reviews  (body: user, rating, [comment])
router.post('/:id/reviews', validateReview, (req, res) => {
  const review = books.addReview(req.params.id, req.body);
  if (!review) {
    return res.status(404).json({ error: 'Not found', message: `No book with id ${req.params.id}` });
  }
  res.status(201).json(review);
});

module.exports = router;
