// Vite's dev server auto-increments its port (5173, 5174, ...) when the
// default is already taken, so a fixed CLIENT_ORIGIN breaks login as soon as
// the frontend isn't on that exact port. Allow any localhost/127.0.0.1 port
// in addition to whatever CLIENT_ORIGIN is configured.
const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

function corsOriginCallback(origin, callback) {
  if (!origin || LOCALHOST_ORIGIN.test(origin) || origin === process.env.CLIENT_ORIGIN) {
    return callback(null, true);
  }
  return callback(new Error(`Not allowed by CORS: ${origin}`));
}

module.exports = { corsOriginCallback };
