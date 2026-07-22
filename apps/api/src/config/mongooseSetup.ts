// WHAT: Must be imported before any model file so every schema picks up
// these defaults at construction time. WHY: controllers return Mongoose
// documents directly (ok(res, { area })); without this, the automatic `id`
// string virtual is stripped from JSON responses, breaking every client
// that expects `.id` instead of raw `_id`.
import mongoose from "mongoose";

mongoose.set("toJSON", { virtuals: true });
mongoose.set("toObject", { virtuals: true });
