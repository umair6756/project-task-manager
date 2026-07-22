// WHAT: Builds the Express app (no listen()) so tests can import it and
// drive it with Supertest without binding a real port.
import "./config/mongooseSetup.js";
import path from "node:path";
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { swaggerSpec } from "./config/swagger.js";
import { apiRateLimiter, authRateLimiter } from "./middleware/rateLimiter.js";
import { activityLogger } from "./middleware/activityLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { areaRouter } from "./modules/areas/area.routes.js";
import { projectRouter } from "./modules/projects/project.routes.js";
import { labelRouter } from "./modules/labels/label.routes.js";
import { trashRouter } from "./modules/trash/trash.routes.js";
import { taskRouter } from "./modules/tasks/task.routes.js";
import { viewsRouter } from "./modules/views/views.routes.js";
import { savedFilterRouter } from "./modules/savedFilters/savedFilter.routes.js";
import { notificationRouter } from "./modules/notifications/notification.routes.js";
import { notebookRouter } from "./modules/notes/notebook.routes.js";
import { noteRouter } from "./modules/notes/note.routes.js";
import { learningItemRouter } from "./modules/learning/learningItem.routes.js";
import { skillRouter } from "./modules/learning/skill.routes.js";
import { certificateRouter } from "./modules/learning/certificate.routes.js";
import { deckRouter } from "./modules/learning/deck.routes.js";
import { cardRouter } from "./modules/learning/card.routes.js";
import { habitRouter } from "./modules/habits/habit.routes.js";
import { routineRouter } from "./modules/habits/routine.routes.js";
import { goalRouter } from "./modules/goals/goal.routes.js";
import { timeEntryRouter } from "./modules/time/timeEntry.routes.js";
import { pomodoroRouter } from "./modules/time/pomodoro.routes.js";
import { reportsRouter } from "./modules/time/reports.routes.js";
import { planningRouter } from "./modules/planning/planning.routes.js";
import { journalRouter } from "./modules/planning/journal.routes.js";
import { reviewRouter } from "./modules/reviews/review.routes.js";
import { analyticsRouter } from "./modules/analytics/analytics.routes.js";
import { gamificationRouter } from "./modules/gamification/gamification.routes.js";
import { searchRouter } from "./modules/search/search.routes.js";
import { platformRouter } from "./modules/platform/platform.routes.js";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  if (env.NODE_ENV !== "test") {
    app.use(pinoHttp({ logger }));
  }
  app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/openapi.json", (_req, res) => res.json(swaggerSpec));

  app.use(healthRouter);
  app.use(apiRateLimiter);
  app.use(activityLogger);

  app.use("/api/auth", authRateLimiter, authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/areas", areaRouter);
  app.use("/api/projects", projectRouter);
  app.use("/api/labels", labelRouter);
  app.use("/api/trash", trashRouter);
  app.use("/api/tasks", taskRouter);
  app.use("/api/views", viewsRouter);
  app.use("/api/saved-filters", savedFilterRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/notebooks", notebookRouter);
  app.use("/api/notes", noteRouter);
  app.use("/api/learning-items", learningItemRouter);
  app.use("/api/skills", skillRouter);
  app.use("/api/certificates", certificateRouter);
  app.use("/api/decks", deckRouter);
  app.use("/api/cards", cardRouter);
  app.use("/api/habits", habitRouter);
  app.use("/api/routines", routineRouter);
  app.use("/api/goals", goalRouter);
  app.use("/api/time-entries", timeEntryRouter);
  app.use("/api/pomodoro", pomodoroRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/planning", planningRouter);
  app.use("/api/journal", journalRouter);
  app.use("/api/reviews", reviewRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/gamification", gamificationRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/platform", platformRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
