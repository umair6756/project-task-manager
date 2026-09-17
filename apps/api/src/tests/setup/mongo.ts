// WHAT: Cleans up MongoDB collections between tests in this suite.
//
// This file deliberately does NOT open or close a mongoose connection.
// The app's bootstrap (wherever mongoose.connect(process.env.MONGO_URI) is
// called on startup) owns the single shared connection for the whole test
// run. An earlier version of this file called mongoose.connect() in
// beforeAll and mongoose.disconnect() in afterAll — since mongoose's
// default connection is a process-wide singleton, that hijacked the shared
// connection mid-run and then tore it down while sibling test files running
// in the same worker were still using it, causing widespread unrelated
// failures (auth tokens missing, writes not visible, etc.).
//
// This file's only job is data isolation between tests: wipe every
// collection after each test so one test's data can't leak into the next.
import mongoose from "mongoose";
import { afterEach } from "vitest";

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});