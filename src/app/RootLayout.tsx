import { Outlet } from "react-router";
import { CURRENT_LCX_RUNG } from "../shared/config.ts";
import styles from "./RootLayout.module.css"; // Adjust this path if you moved the file!

export default function RootLayout() {
  return (
    <div className={styles.appContainer}>
      <header className={styles.appHeader}>
        <h1>Ledgerline Console [LCX-{CURRENT_LCX_RUNG}]</h1>
      </header>

      {/* 
        The Outlet is the "window" where the router renders the active page. 
        If the URL is /accounts, the <AccountsLayout> renders here.
        If the URL is /settings, the Settings placeholder renders here. 
      */}
      <Outlet />
    </div>
  );
}
