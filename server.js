/**
 * server.js
 * -----------------------------------------------------------------------
 * Entry point of the application.
 *
 * This file wires everything together:
 *   - Configures the EJS view engine (used for the Server-Side-Rendered pages)
 *   - Registers global middleware (static files, JSON body parsing, request logger)
 *   - Mounts the route groups:
 *       1) pagesRouter    -> normal HTML pages (SSR): "/" (game), "/store", "/store/:id"
 *       2) apiDocsRouter   -> human-readable API documentation (mounted at /api)
 *       3) booksApiRouter   -> the JSON REST API used both by the store pages and
 *                              by the AJAX "game" (mounted at /api/books)
 *       4) schemasRouter     -> JSON Schema documents for the API resources
 *                               (mounted at /schemas)
 *   - Registers the 404 handler and the centralized error handler (must be last)
 * -----------------------------------------------------------------------
 */

const express = require('express');
const path = require('path');

const logger = require('./middleware/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const pagesRouter = require('./routes/pages');
const apiDocsRouter = require('./routes/apiDocs');
const booksApiRouter = require('./routes/booksApi');
const schemasRouter = require('./routes/schemas');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- View engine (Server-Side Rendering) --------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---- Global middleware ----------------------------------------------------
app.use(express.static(path.join(__dirname, 'public'))); // css/js/images
app.use(express.json());                                 // parse JSON request bodies
app.use(logger);                                          // custom request logger

// ---- Routes -----------------------------------------------------------
app.use('/', pagesRouter);              // SSR pages: game (home) + store
app.use('/api', apiDocsRouter);          // API documentation page (GET /api)
app.use('/api/books', booksApiRouter);    // REST API (JSON), under /api
app.use('/schemas', schemasRouter);        // JSON Schema documents

// ---- 404 + error handling (must be registered last) ------------------
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Books Store server is running -> http://localhost:${PORT}`);
});
