/**
 * middleware/errorHandler.js
 * -----------------------------------------------------------------------
 * Centralized error handling, registered LAST in server.js (after all routes).
 *
 *   - notFoundHandler: runs when no route matched the request at all.
 *                       Responds with JSON for API calls, HTML for pages.
 *   - errorHandler:     a 4-arg Express error middleware. Any route handler
 *                       that calls next(err) - or throws inside an async
 *                       handler that is awaited - ends up here.
 * -----------------------------------------------------------------------
 */

function notFoundHandler(req, res) {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found', message: `No API route matches ${req.method} ${req.originalUrl}` });
  }
  return res.status(404).render('404', { url: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('Unexpected error:', err);
  const status = err.status || 500;

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(status).json({ error: 'Server error', message: err.message || 'Something went wrong' });
  }
  return res.status(status).render('404', { url: req.originalUrl });
}

module.exports = { notFoundHandler, errorHandler };
