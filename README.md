# Books Store - HTTP & REST Training Project

A small Web Applications course project built with **Node.js + Express + EJS**.
It has two parts that share the same REST API:

1. **A normal book store** (Server-Side Rendered pages) - browse, filter and
   sort a catalog of books, view a book's details and reviews.
2. **An interactive "HTTP Game"** - a set of missions that force you to build
   real HTTP requests (choosing the method, route parameter, query
   parameters and/or JSON body) and send them via AJAX (`fetch`) to the
   server, then read the response (status code + JSON) to see if you
   succeeded.

## 1. Requirements

- [Node.js](https://nodejs.org/) v18 or newer (includes `npm`)

## 2. Installation & running

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# (optional) run with auto-restart on file changes, useful during development
npm run dev
```

Then open your browser at **http://localhost:3000**.

- `http://localhost:3000/` &rarr; the HTTP training game (home page)
- `http://localhost:3000/store` &rarr; the book store (SSR pages)
- `http://localhost:3000/api` &rarr; human-readable API documentation
- `http://localhost:3000/api/books` &rarr; the raw JSON REST API
- `http://localhost:3000/schemas` &rarr; JSON Schema documents for the API resources

## 3. Project structure

```
server.js                 # app entry point: wires middleware + routes together
data/
  books.js                 # in-memory "database" (books + reviews) and helper functions
  schemas.js                # JSON Schema documents for the Book and Review resources
middleware/
  logger.js                 # logs every request (method, url, status, duration)
  validateBook.js            # validates request bodies for POST/PUT/PATCH
  errorHandler.js            # 404 handler + centralized error handler
routes/
  booksApi.js                # REST API: /api/books... (always returns JSON)
  apiDocs.js                 # human-readable API documentation page: /api
  schemas.js                 # serves JSON Schema documents: /schemas...
  pages.js                   # SSR pages: "/" (game), "/store", "/store/:id"
views/                        # EJS templates (index, book, game, apiDocs, schemas, 404, partials)
public/
  css/style.css                # styling for every page
  js/missions.js                # the game's mission definitions/data
  js/game.js                    # the game engine (renders UI, sends AJAX requests)
```

## 4. The REST API

All routes are mounted under `/api/books` (i.e. under `/api`) and always return JSON.
A human-readable overview of every endpoint is available at `/api`, and the exact
JSON Schema of each resource (Book, Review) is available at `/schemas`.

| Method | Path                       | Purpose                                   | Uses                          |
|--------|----------------------------|--------------------------------------------|-------------------------------|
| GET    | `/api/books`               | List books                                 | Query params (filter/sort)    |
| GET    | `/api/books/:id`            | Get one book                               | Route parameter               |
| POST   | `/api/books`                | Create a book                              | Request body                  |
| PUT    | `/api/books/:id`             | Replace a book completely                  | Route parameter + body        |
| PATCH  | `/api/books/:id`              | Update part of a book                      | Route parameter + body        |
| DELETE | `/api/books/:id`               | Remove a book                              | Route parameter               |
| GET    | `/api/books/:id/reviews`        | List a book's reviews                      | Route parameter + query params|
| POST   | `/api/books/:id/reviews`         | Add a review to a book                     | Route parameter + body        |

**Query parameters** supported on `GET /api/books`: `category`, `search`
(substring match on title), `minPrice`, `maxPrice`, `sort`
(`price_asc` | `price_desc` | `rating_desc` | `rating_asc` | `title_asc`).
They can be combined, e.g. `/api/books?category=Fantasy&sort=price_asc`.

**Status codes used:** `200` (OK), `201` (Created), `400` (validation error,
e.g. missing/invalid fields), `404` (book or review not found).

## 5. The HTTP Game

`views/game.ejs` renders the page shell; all interactivity lives in
`public/js/game.js`, driven by the mission list in `public/js/missions.js`.

For every mission you:
1. Read the task (plain-language description of what the request should do).
2. Pick the HTTP **method** from the dropdown.
3. Fill in the **route parameter**, if the mission needs one (e.g. a book id).
4. Add **query parameters** (key/value rows) if needed.
5. Write a JSON **request body** if the mission needs one.
6. Click "Send request" - this performs a real `fetch()` call to the API
   above, and shows you the actual HTTP status code and JSON response.

The mission is marked complete only if the *actual server response* matches
what was expected (right method, right status code, right data) - not just
because you clicked something. Progress and score are saved in the browser's
`localStorage`, so completed missions can always be revisited and progress
survives a page refresh.

## 6. Notes on design choices

- Data is kept **in memory** (no database) - the goal of the assignment is to
  practice HTTP/REST mechanics, not persistence.
- `express.json()` + a small validation middleware (`middleware/validateBook.js`)
  ensure the API never crashes on malformed input and always answers with a
  clear JSON error message and an appropriate status code.
- The store pages (`/`, `/books/:id`) are fully Server-Side Rendered with
  EJS: filtering/sorting on the store page happens through a normal HTML
  `<form method="GET">`, so the query string is visible in the browser's
  address bar - a good, concrete example of query parameters "at work" in
  a normal web page context, complementing the AJAX-driven game.
