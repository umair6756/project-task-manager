// WHAT: Spins up an in-memory MongoDB for the whole test run so Supertest
// hits a real Mongoose-backed API without any external DB dependency.
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { beforeAll, afterAll, afterEach } from "vitest";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Mongoose builds indexes (including text indexes) asynchronously in the
  // background after connecting — it does NOT wait for them before the
  // connect() promise resolves. On a fresh in-memory database, that creates
  // a race: if a test's very first query against a collection is a $text
  // search, it can run before that collection's text index finishes
  // building, and MongoDB throws "text index required for $text query"
  // (surfacing as a 500). Explicitly syncing indexes here, before any test
  // runs, closes that race for good.
  await mongoose.connection.syncIndexes();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});