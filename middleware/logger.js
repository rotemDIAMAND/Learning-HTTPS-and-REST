/**
 * middleware/logger.js
 * -----------------------------------------------------------------------
 * A tiny custom logging middleware (this satisfies the "at least one
 * middleware" requirement from the assignment).
 *
 * It runs on every incoming request, prints the method/url/status/duration
 * to the terminal, then calls next() to continue to the next middleware /
 * route handler. This is the same pattern used by libraries like `morgan`.
 * -----------------------------------------------------------------------
 */

function logger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });

  next();
}

module.exports = logger;
