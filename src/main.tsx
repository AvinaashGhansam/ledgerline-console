import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App.tsx";

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
    <App />
  </StrictMode>,
);
