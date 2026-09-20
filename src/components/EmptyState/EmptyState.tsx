import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

const EmptyState = ({ children }: { children: ReactNode }) => {
  return <div className={styles.container}>{children}</div>;
};
export default EmptyState;
