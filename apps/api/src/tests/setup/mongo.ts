// WHAT: Connects to the shared MongoDB instance (provided via MONGO_URI —
// a real mongo service container in CI, or a local/dev instance otherwise)
// so Supertest hits a real Mongoose-backed API. Each test file gets its own
// database name so parallel test files don't collide.
import mongoose from "mongoose";
import { beforeAll, afterAll, afterEach } from "vitest";

const baseUri = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/flowforge_test";

// Give this suite its own database on the shared instance so it can run
// alongside other test files without stepping on their data.
const uri = `${baseUri}_tasks`;

beforeAll(async () => {
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});