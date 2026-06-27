/**
 * ALAYA INSIDER — Hostinger Passenger startup file
 *
 * Passenger (Hostinger's Apache module) uses this file to start
 * and manage the Next.js production server. It creates a standard
 * Node.js HTTP server that delegates all requests to Next.js.
 *
 * Passenger sets the PORT env var; we default to 3000.
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = parseInt(process.env.PORT || "3000", 10);

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:" + port);
  });
});
