import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App.tsx";
import { ToastProvider } from "./shared/toast/ToastProvider.tsx";

if (import.meta.env.VITE_API_MODE === "mock") {
  const { worker } = await import("./mocks/browser.ts");
  await worker.start();
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element does not exist in createRoot");
}
createRoot(rootElement).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
