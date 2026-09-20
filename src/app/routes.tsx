import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import EmptyState from "../components/EmptyState/EmptyState.tsx";
import AccountDetail from "../features/accounts/AccountDetail.tsx";
import AccountsLayout from "../features/accounts/AccountsLayout.tsx";
import RootLayout from "./RootLayout.tsx";

const LazySettings = lazy(() => import("../features/settings/Settings.tsx"));

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
            element: <EmptyState>Select an account from the sidebar to view entries</EmptyState>,
          },
          {
            path: ":accountId",
            element: <AccountDetail />,
          },
        ],
      },
      {
        path: "/settings",
        element: (
          <Suspense fallback={<div>Loading Settings...</div>}>
            <LazySettings />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: <EmptyState>404 - Not Found</EmptyState>,
      },
    ],
  },
]);
