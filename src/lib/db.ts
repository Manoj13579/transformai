import mongoose from "mongoose";
/* in development all api route functions are served locally in same server. when deployed eg in vercel, netlify these functions are executed in different servers in cloud. these functions still share state. below uses caching mechanism to ensure efficient and singleton-like database connections. in a Next.js where serverless functions may execute repeatedly for each request, to solve this we import below in each api route function so if database connection is already created, we reuse it. expess.js has only one server and once db connection is enough don't need these*/
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define mongo_uri in env variables");
}
// global.mongoose from types.d.ts. look there
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/*This is the main exported function that handles the database connection. If a connection (cached.conn) already exists, it returns the cached connection immediately to avoid redundant connection attempts. */
export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }
// f no connection promise exists (cached.promise is null), a new connection is initiated using mongoose.connect(MONGODB_URI, opts).
  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => mongoose.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}