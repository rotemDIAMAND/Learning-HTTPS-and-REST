/**
 * middleware/validateBook.js
 * -----------------------------------------------------------------------
 * Small validation middlewares for the request body of the "books" API.
 * They run BEFORE the route handler and short-circuit with a 400 JSON
 * response if the body is invalid, so the route handler can assume the
 * data it receives is already well-formed.
 * -----------------------------------------------------------------------
 */

const REQUIRED_FIELDS = ['title', 'author', 'category', 'price'];

/** Used for POST /api/books and PUT /api/books/:id - all fields are required. */
function validateFullBook(req, res, next) {
  const body = req.body || {};
  const missing = REQUIRED_FIELDS.filter((field) => body[field] === undefined || body[field] === '');

  if (missing.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: `Missing required field(s): ${missing.join(', ')}`,
    });
  }

  if (Number.isNaN(Number(body.price)) || Number(body.price) < 0) {
    return res.status(400).json({ error: 'Validation failed', message: '"price" must be a positive number' });
  }

  next();
}

/** Used for PATCH /api/books/:id - body must exist and only contain known fields. */
function validatePartialBook(req, res, next) {
  const body = req.body || {};
  const allowedFields = [...REQUIRED_FIELDS, 'year', 'stock'];

  if (Object.keys(body).length === 0) {
    return res.status(400).json({ error: 'Validation failed', message: 'Request body cannot be empty' });
  }

  const unknown = Object.keys(body).filter((key) => !allowedFields.includes(key));
  if (unknown.length > 0) {
    return res.status(400).json({ error: 'Validation failed', message: `Unknown field(s): ${unknown.join(', ')}` });
  }

  if (body.price !== undefined && (Number.isNaN(Number(body.price)) || Number(body.price) < 0)) {
    return res.status(400).json({ error: 'Validation failed', message: '"price" must be a positive number' });
  }

  next();
}

/** Used for POST /api/books/:id/reviews */
function validateReview(req, res, next) {
  const body = req.body || {};

  if (!body.user || body.rating === undefined) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Both "user" and "rating" are required',
    });
  }

  const rating = Number(body.rating);
  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Validation failed', message: '"rating" must be a number between 1 and 5' });
  }

  next();
}

module.exports = { validateFullBook, validatePartialBook, validateReview };
