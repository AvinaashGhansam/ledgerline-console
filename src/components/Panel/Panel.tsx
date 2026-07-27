import type { ReactNode } from "react";
import styles from "./Panel.module.css";

type PanelProps = {
  title: string;
  children: ReactNode;
};

const Panel = ({ title, children }: PanelProps) => {
  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </header>
      <div className={styles.content}>{children}</div>
    </section>
  );
};
export default Panel;
