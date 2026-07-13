// Custom entry point for hosts (like cPanel's "Setup Node.js App" / Passenger)
// that expect a plain Node.js server listening on process.env.PORT instead of
// running the `next start` CLI directly.
const { createServer } = require("node:http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`Kemkan server ready on port ${port}`);
  });
});
