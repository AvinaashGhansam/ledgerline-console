import { createBrowserRouter, Navigate } from "react-router";
import AccountsLayout from "../features/accounts/AccountsLayout.tsx";
import RootLayout from "./RootLayout.tsx";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Navigate to="/accounts" replace /> },
      {
        path: "/accounts",
        element: <AccountsLayout />,
        children: [
          {
            index: true,
            element: <div>Select an account from the sidebar to view entries</div>,
          },
          {
            path: ":accountId",
            element: (
              <div style={{ padding: "20px", border: "2px dashed green" }}>
                Account Details Placeholder
              </div>
            ),
          },
          {
            path: ":accountId/post",
            element: (
              <div style={{ padding: "20px", border: "2px dashed red" }}>
                Post Transfer Placeholder
              </div>
            ),
          },
        ],
      },
      {
        path: "/settings",
        element: <div style={{ padding: "20px" }}>Settings Placeholder</div>,
      },
      {
        path: "*",
        element: <div style={{ padding: "20px" }}>404 - Not Found Catch-All</div>,
      },
    ],
  },
]);
