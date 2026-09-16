/**
 * routes/pages.js
 * -----------------------------------------------------------------------
 * "Normal" HTML pages, Server-Side Rendered with EJS.
 *
 *   GET /             -> the interactive HTTP-training game shell (home page).
 *                        The page itself is server-rendered, but all the game
 *                        logic happens client-side via AJAX (public/js/game.js).
 *   GET /store         -> store front page: lists books, supports the exact same
 *                         filter/sort query params as the API (?category=&sort=...)
 *                         but renders full HTML instead of JSON.
 *   GET /store/:id      -> a single book's detail page (route parameter),
 *                          with its reviews, rendered server-side.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const books = require('../data/books');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('game');
});

router.get('/store', (req, res) => {
  const { category, search, minPrice, maxPrice, sort } = req.query;
  const allBooks = books.getAllBooks({ category, search, minPrice, maxPrice, sort });
  const categories = [...new Set(books.getAllBooks().map((b) => b.category))];

  res.render('index', {
    books: allBooks,
    categories,
    filters: { category, search, minPrice, maxPrice, sort },
  });
});

router.get('/store/:id', (req, res) => {
  const book = books.getBookById(req.params.id);
  if (!book) {
    return res.status(404).render('404', { url: req.originalUrl });
  }
  const bookReviews = books.getReviewsForBook(req.params.id);
  res.render('book', { book, reviews: bookReviews });
});

module.exports = router;
