import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { router } from "@/app/router";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster theme="dark" position="bottom-right" richColors />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
