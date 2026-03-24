import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app.tsx";
import { AppErrorBoundary } from "./shared/components/global-error";

// biome-ignore lint/style/noNonNullAssertion: <explanation> We are certain that the element with id "root" exists in the HTML.</explanation>
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
