/**
 * routes/apiDocs.js
 * -----------------------------------------------------------------------
 * A small human-readable documentation page for the REST API, mounted at
 * /api in server.js. This is separate from /api/books (the actual JSON
 * API, handled by routes/booksApi.js) - GET /api itself only renders the
 * documentation page and does not touch the books data at all.
 * -----------------------------------------------------------------------
 */

const express = require('express');

const router = express.Router();

const ENDPOINTS = [
  { method: 'GET', path: '/api/books', uses: 'Query parameters', description: 'List books. Supports category, search, minPrice, maxPrice, sort.' },
  { method: 'GET', path: '/api/books/:id', uses: 'Route parameter', description: 'Get a single book by id.' },
  { method: 'POST', path: '/api/books', uses: 'Request body', description: 'Create a new book (title, author, category, price required).' },
  { method: 'PUT', path: '/api/books/:id', uses: 'Route parameter + body', description: 'Replace a book completely.' },
  { method: 'PATCH', path: '/api/books/:id', uses: 'Route parameter + body', description: 'Partially update a book.' },
  { method: 'DELETE', path: '/api/books/:id', uses: 'Route parameter', description: 'Delete a book.' },
  { method: 'GET', path: '/api/books/:id/reviews', uses: 'Route parameter + query parameters', description: 'List reviews for a book. Supports minRating, sort.' },
  { method: 'POST', path: '/api/books/:id/reviews', uses: 'Route parameter + body', description: 'Add a review to a book (user, rating required).' },
];

router.get('/', (req, res) => {
  res.render('apiDocs', { endpoints: ENDPOINTS });
});

module.exports = router;
