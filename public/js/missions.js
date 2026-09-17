/**
 * public/js/missions.js
 * -----------------------------------------------------------------------
 * Data-only file: defines every mission ("stage") of the HTTP training
 * game. Kept separate from game.js (the engine) so it's easy to read/edit
 * the missions without touching the game logic.
 *
 * Each mission:
 *   - id, title, task   : what is shown to the player
 *   - pathTemplate      : the API path, "{id}" marks where the route
 *                         parameter (if any) gets substituted
 *   - hasRouteParam      : whether this mission needs a route parameter input
 *   - expectedMethod     : the HTTP method the mission expects the player to pick
 *   - hint               : shown when the player clicks "Show hint"
 *   - needsBody          : whether the body textarea should be shown
 *   - validate(ctx)      : ctx = { method, routeParam, query, body, status, data }
 *                          returns { success: boolean, message: string }
 * -----------------------------------------------------------------------
 */

const MISSIONS = [
  {
    id: 1,
    title: 'Level 1 - List the whole catalog',
    task: 'Send a request that returns every book currently in the store.',
    pathTemplate: '/api/books',
    hasRouteParam: false,
    expectedMethod: 'GET',
    needsBody: false,
    hint: 'Method: GET. Path: /api/books. No route parameter, no query parameters needed.',
    validate(ctx) {
      if (ctx.method !== 'GET') return { success: false, message: 'This mission requires a GET request.' };
      if (ctx.status !== 200) return { success: false, message: `Expected status 200, got ${ctx.status}.` };
      if (!ctx.data || !Array.isArray(ctx.data.books) || ctx.data.books.length === 0) {
        return { success: false, message: 'Expected a non-empty "books" array in the response.' };
      }
      return { success: true, message: `Nice! You received ${ctx.data.books.length} book(s).` };
    },
  },
  {
    id: 2,
    title: 'Level 2 - Filter by category',
    task: 'Show only the books in the "Fantasy" category, using a query parameter.',
    pathTemplate: '/api/books',
    hasRouteParam: false,
    expectedMethod: 'GET',
    needsBody: false,
    hint: 'Add a query parameter named "category" with the value "Fantasy".',
    validate(ctx) {
      if (ctx.method !== 'GET') return { success: false, message: 'This mission requires a GET request.' };
      if (ctx.status !== 200) return { success: false, message: `Expected status 200, got ${ctx.status}.` };
      const list = ctx.data && ctx.data.books;
      if (!Array.isArray(list) || list.length === 0) return { success: false, message: 'No books were returned - check your query parameter.' };
      const allFantasy = list.every((b) => b.category.toLowerCase() === 'fantasy');
      if (!allFantasy) return { success: false, message: 'Some returned books are not in the Fantasy category.' };
      return { success: true, message: `Great! ${list.length} Fantasy book(s) found.` };
    },
  },
  {
    id: 3,
    title: 'Level 3 - Filter AND sort together',
    task: 'Show the "Fantasy" books again, but this time sorted by price from the cheapest to the most expensive. This requires two query parameters at once.',
    pathTemplate: '/api/books',
    hasRouteParam: false,
    expectedMethod: 'GET',
    needsBody: false,
    hint: 'Use two query parameters together: category=Fantasy and sort=price_asc.',
    validate(ctx) {
      if (ctx.method !== 'GET') return { success: false, message: 'This mission requires a GET request.' };
      if (Object.keys(ctx.query).length < 2) return { success: false, message: 'You need to use at least two query parameters for this mission.' };
      if (ctx.status !== 200) return { success: false, message: `Expected status 200, got ${ctx.status}.` };
      const list = ctx.data && ctx.data.books;
      if (!Array.isArray(list) || list.length < 2) return { success: false, message: 'Not enough results returned - check the category filter.' };
      const allFantasy = list.every((b) => b.category.toLowerCase() === 'fantasy');
      if (!allFantasy) return { success: false, message: 'Some returned books are not in the Fantasy category.' };
      const sorted = list.every((b, i) => i === 0 || list[i - 1].price <= b.price);
      if (!sorted) return { success: false, message: 'The results are not sorted by price ascending.' };
      return { success: true, message: 'Perfect combination of filter + sort!' };
    },
  },
  {
    id: 4,
    title: 'Level 4 - Get one specific book',
    task: 'Fetch the full details of the book with id 2, using a route parameter.',
    pathTemplate: '/api/books/{id}',
    hasRouteParam: true,
    routeParamName: 'id',
    expectedMethod: 'GET',
    needsBody: false,
    hint: 'Method: GET. Put "2" in the route parameter field. Path becomes /api/books/2.',
    validate(ctx) {
      if (ctx.method !== 'GET') return { success: false, message: 'This mission requires a GET request.' };
      if (String(ctx.routeParam) !== '2') return { success: false, message: 'Use "2" as the route parameter.' };
      if (ctx.status !== 200) return { success: false, message: `Expected status 200, got ${ctx.status}.` };
      if (!ctx.data || ctx.data.id !== 2) return { success: false, message: 'The response does not contain book id 2.' };
      return { success: true, message: `Found it: "${ctx.data.title}".` };
    },
  },
  {
    id: 5,
    title: 'Level 5 - Handle a "not found" response',
    task: 'Request a book with id 999, which does not exist. Confirm the server answers with a proper error status and read the error message.',
    pathTemplate: '/api/books/{id}',
    hasRouteParam: true,
    routeParamName: 'id',
    expectedMethod: 'GET',
    needsBody: false,
    hint: 'Method: GET. Route parameter: 999. A correct API should answer with status 404, not 200.',
    validate(ctx) {
      if (ctx.method !== 'GET') return { success: false, message: 'This mission requires a GET request.' };
      if (String(ctx.routeParam) !== '999') return { success: false, message: 'Use "999" as the route parameter (an id that does not exist).' };
      if (ctx.status !== 404) return { success: false, message: `Expected status 404 for a missing resource, got ${ctx.status}.` };
      if (!ctx.data || !ctx.data.error) return { success: false, message: 'Expected an "error" field describing the problem.' };
      return { success: true, message: 'Correct - you identified an invalid/error response.' };
    },
  },
  {
    id: 6,
    title: 'Level 6 - Reviews of a book, filtered',
    task: 'Book id 3 ("Dune") has several reviews. Fetch only the reviews with a rating of at least 4. This mixes a route parameter with a query parameter.',
    pathTemplate: '/api/books/{id}/reviews',
    hasRouteParam: true,
    routeParamName: 'id',
    expectedMethod: 'GET',
    needsBody: false,
    hint: 'Route parameter: 3. Query parameter: minRating=4.',
    validate(ctx) {
      if (ctx.method !== 'GET') return { success: false, message: 'This mission requires a GET request.' };
      if (String(ctx.routeParam) !== '3') return { success: false, message: 'Use "3" as the route parameter (Dune\'s id).' };
      if (!ctx.query.minRating) return { success: false, message: 'Add a query parameter named "minRating".' };
      if (ctx.status !== 200) return { success: false, message: `Expected status 200, got ${ctx.status}.` };
      const list = ctx.data && ctx.data.reviews;
      if (!Array.isArray(list) || list.length === 0) return { success: false, message: 'No reviews returned - check the minRating value (try 4).' };
      const allHighRated = list.every((r) => r.rating >= 4);
      if (!allHighRated) return { success: false, message: 'Some reviews have a rating below your filter value.' };
      return { success: true, message: 'Route parameter + query parameter combined correctly!' };
    },
  },
  {
    id: 7,
    title: 'Level 7 - Add a new book',
    task: 'Create a brand new book in the catalog by sending a JSON request body with title, author, category and price.',
    pathTemplate: '/api/books',
    hasRouteParam: false,
    expectedMethod: 'POST',
    needsBody: true,
    bodyPlaceholder: '{\n  "title": "My New Book",\n  "author": "Some Author",\n  "category": "Sci-Fi",\n  "price": 25\n}',
    hint: 'Method: POST. Path: /api/books. Body must include title, author, category and price.',
    validate(ctx) {
      if (ctx.method !== 'POST') return { success: false, message: 'This mission requires a POST request.' };
      if (ctx.status !== 201) return { success: false, message: `Expected status 201 (Created), got ${ctx.status}.` };
      if (!ctx.body || !ctx.body.title) return { success: false, message: 'Your request body must include at least a "title" field.' };
      if (!ctx.data || ctx.data.title !== ctx.body.title) return { success: false, message: 'The created book in the response does not match your request body.' };
      return { success: true, message: `Created "${ctx.data.title}" with id ${ctx.data.id}.` };
    },
  },
  {
    id: 8,
    title: 'Level 8 - Replace a book completely',
    task: 'Book id 7 ("Pride and Prejudice") needs a full update. Send a PUT request with a complete new body (title, author, category, price).',
    pathTemplate: '/api/books/{id}',
    hasRouteParam: true,
    routeParamName: 'id',
    expectedMethod: 'PUT',
    needsBody: true,
    bodyPlaceholder: '{\n  "title": "Pride and Prejudice",\n  "author": "Jane Austen",\n  "category": "Romance",\n  "price": 25\n}',
    hint: 'Route parameter: 7. Method: PUT. Include all fields in the body, PUT replaces the whole resource.',
    validate(ctx) {
      if (ctx.method !== 'PUT') return { success: false, message: 'This mission requires a PUT request.' };
      if (String(ctx.routeParam) !== '7') return { success: false, message: 'Use "7" as the route parameter.' };
      if (ctx.status !== 200) return { success: false, message: `Expected status 200, got ${ctx.status}.` };
      if (!ctx.body || !ctx.body.price) return { success: false, message: 'Your body must include a "price" field.' };
      if (!ctx.data || Number(ctx.data.price) !== Number(ctx.body.price)) {
        return { success: false, message: 'The updated price in the response does not match your request body.' };
      }
      return { success: true, message: 'The book was fully replaced with your new data.' };
    },
  },
  {
    id: 9,
    title: 'Level 9 - Partially update a book',
    task: 'Book id 8 ("The Notebook") just needs a price change to 15. Use PATCH to update only the price field, without sending the rest of the book.',
    pathTemplate: '/api/books/{id}',
    hasRouteParam: true,
    routeParamName: 'id',
    expectedMethod: 'PATCH',
    needsBody: true,
    bodyPlaceholder: '{\n  "price": 15\n}',
    hint: 'Route parameter: 8. Method: PATCH. Body only needs the field(s) you want to change.',
    validate(ctx) {
      if (ctx.method !== 'PATCH') return { success: false, message: 'This mission requires a PATCH request.' };
      if (String(ctx.routeParam) !== '8') return { success: false, message: 'Use "8" as the route parameter.' };
      if (ctx.status !== 200) return { success: false, message: `Expected status 200, got ${ctx.status}.` };
      if (!ctx.body || ctx.body.price === undefined) return { success: false, message: 'Your body must include a "price" field.' };
      if (!ctx.data || Number(ctx.data.price) !== Number(ctx.body.price)) {
        return { success: false, message: 'The price in the response does not match the value you sent.' };
      }
      return { success: true, message: 'Partial update applied successfully.' };
    },
  },
  {
    id: 10,
    title: 'Level 10 - Post a review',
    task: 'Add a new review to book id 5 ("Murder on the Orient Express"): a user name and a rating (1-5).',
    pathTemplate: '/api/books/{id}/reviews',
    hasRouteParam: true,
    routeParamName: 'id',
    expectedMethod: 'POST',
    needsBody: true,
    bodyPlaceholder: '{\n  "user": "Your Name",\n  "rating": 5,\n  "comment": "Loved it!"\n}',
    hint: 'Route parameter: 5. Method: POST. Body needs "user" and "rating" (1-5).',
    validate(ctx) {
      if (ctx.method !== 'POST') return { success: false, message: 'This mission requires a POST request.' };
      if (String(ctx.routeParam) !== '5') return { success: false, message: 'Use "5" as the route parameter.' };
      if (ctx.status !== 201) return { success: false, message: `Expected status 201 (Created), got ${ctx.status}.` };
      if (!ctx.data || ctx.data.bookId !== 5) return { success: false, message: 'The review does not seem to belong to book id 5.' };
      return { success: true, message: 'Review added successfully!' };
    },
  },
  {
    id: 11,
    title: 'Level 11 - Remove a book',
    task: 'Book id 10 ("Guns, Germs, and Steel") is being discontinued. Delete it from the catalog.',
    pathTemplate: '/api/books/{id}',
    hasRouteParam: true,
    routeParamName: 'id',
    expectedMethod: 'DELETE',
    needsBody: false,
    hint: 'Route parameter: 10. Method: DELETE. No body needed.',
    validate(ctx) {
      if (ctx.method !== 'DELETE') return { success: false, message: 'This mission requires a DELETE request.' };
      if (String(ctx.routeParam) !== '10') return { success: false, message: 'Use "10" as the route parameter.' };
      if (ctx.status !== 200) return { success: false, message: `Expected status 200, got ${ctx.status}.` };
      return { success: true, message: 'The book was removed from the catalog.' };
    },
  },
  {
    id: 12,
    title: 'Level 12 (bonus) - Trigger a validation error',
    task: 'Try to PATCH book id 1 with a negative price (e.g. -5) and confirm the server rejects it with a client error status.',
    pathTemplate: '/api/books/{id}',
    hasRouteParam: true,
    routeParamName: 'id',
    expectedMethod: 'PATCH',
    needsBody: true,
    bodyPlaceholder: '{\n  "price": -5\n}',
    hint: 'Route parameter: 1. Method: PATCH. Send a negative "price" - a well behaved API must answer 400, not 200.',
    validate(ctx) {
      if (ctx.method !== 'PATCH') return { success: false, message: 'This mission requires a PATCH request.' };
      if (String(ctx.routeParam) !== '1') return { success: false, message: 'Use "1" as the route parameter.' };
      if (!ctx.body || Number(ctx.body.price) >= 0) return { success: false, message: 'Send a negative price value in the body.' };
      if (ctx.status !== 400) return { success: false, message: `A negative price should be rejected with status 400, but got ${ctx.status}.` };
      return { success: true, message: 'Exactly right - the server validated the input and rejected it.' };
    },
  },
];
