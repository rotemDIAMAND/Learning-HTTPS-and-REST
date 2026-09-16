/**
 * data/schemas.js
 * -----------------------------------------------------------------------
 * JSON Schema (draft-07) definitions describing the shape of the resources
 * exposed by the REST API. These are served as plain JSON documents under
 * /schemas, so any client (or a teacher grading the project) can inspect
 * exactly what fields a "book" or a "review" is expected to have, what
 * type each field is, and which fields are required.
 * -----------------------------------------------------------------------
 */

const bookSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: '/schemas/book',
  title: 'Book',
  type: 'object',
  description: 'A single book in the store catalog.',
  properties: {
    id: { type: 'integer', description: 'Unique identifier, assigned by the server.' },
    title: { type: 'string', description: 'Title of the book.' },
    author: { type: 'string', description: 'Author of the book.' },
    category: { type: 'string', description: 'Genre/category, e.g. Fantasy, Sci-Fi, Mystery.' },
    price: { type: 'number', minimum: 0, description: 'Price in USD.' },
    year: { type: ['integer', 'null'], description: 'Year of first publication.' },
    stock: { type: 'integer', minimum: 0, description: 'Number of copies currently in stock.' },
    rating: { type: 'number', minimum: 0, maximum: 5, description: 'Average rating, derived from reviews.' },
  },
  required: ['id', 'title', 'author', 'category', 'price'],
};

const reviewSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: '/schemas/review',
  title: 'Review',
  type: 'object',
  description: 'A single review left by a user on a book.',
  properties: {
    id: { type: 'integer', description: 'Unique identifier, assigned by the server.' },
    bookId: { type: 'integer', description: 'Id of the book this review belongs to.' },
    user: { type: 'string', description: 'Display name of the reviewer.' },
    rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating given by the user (1-5).' },
    comment: { type: 'string', description: 'Free-text comment.' },
  },
  required: ['id', 'bookId', 'user', 'rating'],
};

module.exports = { bookSchema, reviewSchema };
