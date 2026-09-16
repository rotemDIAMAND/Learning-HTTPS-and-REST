/**
 * data/books.js
 * -----------------------------------------------------------------------
 * A very small "fake database" kept in memory (a plain JS array).
 * There is no real database in this project on purpose - the assignment is
 * about practicing HTTP / REST, not about persistence layers.
 *
 * This module exposes plain functions that the routes call. Keeping all the
 * data logic here (instead of inside routes/booksApi.js) keeps the route
 * handlers thin and easy to read.
 * -----------------------------------------------------------------------
 */

// Every book also has a "rating" field, used by the reviews endpoints below.
let books = [
  { id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Fantasy', price: 42, year: 1937, stock: 12, rating: 4.7 },
  { id: 2, title: 'A Game of Thrones', author: 'George R.R. Martin', category: 'Fantasy', price: 55, year: 1996, stock: 5, rating: 4.6 },
  { id: 3, title: 'Dune', author: 'Frank Herbert', category: 'Sci-Fi', price: 48, year: 1965, stock: 8, rating: 4.8 },
  { id: 4, title: 'Foundation', author: 'Isaac Asimov', category: 'Sci-Fi', price: 39, year: 1951, stock: 0, rating: 4.5 },
  { id: 5, title: 'Murder on the Orient Express', author: 'Agatha Christie', category: 'Mystery', price: 29, year: 1934, stock: 14, rating: 4.4 },
  { id: 6, title: 'Gone Girl', author: 'Gillian Flynn', category: 'Mystery', price: 33, year: 2012, stock: 6, rating: 4.1 },
  { id: 7, title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Romance', price: 22, year: 1813, stock: 20, rating: 4.6 },
  { id: 8, title: 'The Notebook', author: 'Nicholas Sparks', category: 'Romance', price: 19, year: 1996, stock: 9, rating: 4.0 },
  { id: 9, title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', price: 60, year: 2011, stock: 3, rating: 4.7 },
  { id: 10, title: 'Guns, Germs, and Steel', author: 'Jared Diamond', category: 'History', price: 45, year: 1997, stock: 7, rating: 4.3 },
];

let reviews = [
  { id: 1, bookId: 1, user: 'Dana', rating: 5, comment: 'A timeless classic!' },
  { id: 2, bookId: 1, user: 'Omer', rating: 4, comment: 'Great world building.' },
  { id: 3, bookId: 3, user: 'Noa', rating: 5, comment: 'Best sci-fi book ever.' },
  { id: 4, bookId: 3, user: 'Itay', rating: 3, comment: 'A bit slow at the start.' },
  { id: 5, bookId: 5, user: 'Maya', rating: 5, comment: 'Brilliant mystery.' },
];

let nextBookId = books.length + 1;
let nextReviewId = reviews.length + 1;

/**
 * Returns books, optionally filtered/sorted according to query parameters.
 * @param {Object} filters
 * @param {string} [filters.category]
 * @param {string} [filters.search]     - substring match on the title
 * @param {number} [filters.minPrice]
 * @param {number} [filters.maxPrice]
 * @param {string} [filters.sort]       - price_asc | price_desc | rating_desc | rating_asc | title_asc
 */
function getAllBooks(filters = {}) {
  let result = [...books];
  const { category, search, minPrice, maxPrice, sort } = filters;

  if (category) {
    result = result.filter((b) => b.category.toLowerCase() === String(category).toLowerCase());
  }
  if (search) {
    const term = String(search).toLowerCase();
    result = result.filter((b) => b.title.toLowerCase().includes(term));
  }
  if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) {
    result = result.filter((b) => b.price >= Number(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
    result = result.filter((b) => b.price <= Number(maxPrice));
  }

  switch (sort) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating_desc':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'rating_asc':
      result.sort((a, b) => a.rating - b.rating);
      break;
    case 'title_asc':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break; // no sorting requested
  }

  return result;
}

function getBookById(id) {
  return books.find((b) => b.id === Number(id));
}

function createBook(payload) {
  const newBook = {
    id: nextBookId++,
    title: payload.title,
    author: payload.author,
    category: payload.category,
    price: Number(payload.price),
    year: payload.year ? Number(payload.year) : null,
    stock: payload.stock !== undefined ? Number(payload.stock) : 0,
    rating: 0,
  };
  books.push(newBook);
  return newBook;
}

/** Full replace (PUT). Returns null if the book does not exist. */
function replaceBook(id, payload) {
  const index = books.findIndex((b) => b.id === Number(id));
  if (index === -1) return null;

  const existing = books[index];
  const updated = {
    id: existing.id,
    title: payload.title,
    author: payload.author,
    category: payload.category,
    price: Number(payload.price),
    year: payload.year ? Number(payload.year) : null,
    stock: payload.stock !== undefined ? Number(payload.stock) : 0,
    rating: existing.rating,
  };
  books[index] = updated;
  return updated;
}

/** Partial update (PATCH). Returns null if the book does not exist. */
function updateBook(id, partialPayload) {
  const index = books.findIndex((b) => b.id === Number(id));
  if (index === -1) return null;

  books[index] = { ...books[index], ...partialPayload };
  return books[index];
}

/** Returns the removed book, or null if it did not exist. */
function deleteBook(id) {
  const index = books.findIndex((b) => b.id === Number(id));
  if (index === -1) return null;
  const [removed] = books.splice(index, 1);
  reviews = reviews.filter((r) => r.bookId !== Number(id));
  return removed;
}

function getReviewsForBook(bookId, filters = {}) {
  let result = reviews.filter((r) => r.bookId === Number(bookId));
  const { minRating, sort } = filters;

  if (minRating !== undefined && minRating !== '' && !Number.isNaN(Number(minRating))) {
    result = result.filter((r) => r.rating >= Number(minRating));
  }

  if (sort === 'rating_desc') result.sort((a, b) => b.rating - a.rating);
  if (sort === 'rating_asc') result.sort((a, b) => a.rating - b.rating);

  return result;
}

function addReview(bookId, payload) {
  const book = getBookById(bookId);
  if (!book) return null;

  const review = {
    id: nextReviewId++,
    bookId: Number(bookId),
    user: payload.user,
    rating: Number(payload.rating),
    comment: payload.comment || '',
  };
  reviews.push(review);

  // keep the book's average rating roughly up to date
  const bookReviews = reviews.filter((r) => r.bookId === Number(bookId));
  book.rating = Number(
    (bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length).toFixed(1)
  );

  return review;
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  replaceBook,
  updateBook,
  deleteBook,
  getReviewsForBook,
  addReview,
};
