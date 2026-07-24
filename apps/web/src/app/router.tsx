import { createRootRoute, createRoute, createRouter, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { AppShell } from "@/features/shell/AppShell";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/ResetPasswordPage";
import { DashboardPage } from "@/features/shell/DashboardPage";
import { TasksPage } from "@/features/tasks/TasksPage";
import { NotesPage } from "@/features/notes/NotesPage";
import { LearningPage } from "@/features/learning/LearningPage";
import { HabitsPage } from "@/features/habits/HabitsPage";
import { GoalsPage } from "@/features/goals/GoalsPage";
import { TimePage } from "@/features/time/TimePage";
import { ReviewsPage } from "@/features/reviews/ReviewsPage";
import { JournalPage } from "@/features/journal/JournalPage";
import { AnalyticsPage } from "@/features/analytics/AnalyticsPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { SearchPage } from "@/features/search/SearchPage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

function requireAuth() {
  if (!useAuthStore.getState().refreshToken) {
    throw redirect({ to: "/login" });
  }
}

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authed",
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/",
  component: DashboardPage,
});

const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginPage });
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: "/register", component: RegisterPage });
const forgotPasswordRoute = createRoute({ getParentRoute: () => rootRoute, path: "/forgot-password", component: ForgotPasswordPage });
const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  validateSearch: (search: Record<string, unknown>) => ({ token: typeof search.token === "string" ? search.token : undefined }),
  component: ResetPasswordPage,
});

const tasksRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: "/tasks", component: TasksPage });
const notesRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: "/notes", component: NotesPage });
const learningRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: "/learning", component: LearningPage });
const habitsRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: "/habits", component: HabitsPage });
const goalsRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: "/goals", component: GoalsPage });
const timeRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: "/time", component: TimePage });
const reviewsRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: "/reviews", component: ReviewsPage });
const journalRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: "/journal", component: JournalPage });
const analyticsRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: "/analytics", component: AnalyticsPage });
const settingsRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: "/settings", component: SettingsPage });
const searchRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: "/search", component: SearchPage });

const routeTree = rootRoute.addChildren([
  authLayoutRoute.addChildren([
    dashboardRoute,
    tasksRoute,
    notesRoute,
    learningRoute,
    habitsRoute,
    goalsRoute,
    timeRoute,
    reviewsRoute,
    journalRoute,
    analyticsRoute,
    settingsRoute,
    searchRoute,
  ]),
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
