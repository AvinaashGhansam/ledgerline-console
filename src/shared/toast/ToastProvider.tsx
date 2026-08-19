import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Toast.module.css";

type ToastProp = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastVariant = "success" | "error";

type ToastAPIProp = {
  show: (message: string, variant: ToastVariant) => void;
  dismiss: (id: string) => void;
};

const ToastStateContext = createContext<ToastProp[] | null>(null);
const ToastAPIContext = createContext<ToastAPIProp | null>(null);

const ToastViewport = () => {
  const context = useContext(ToastStateContext);
  const { dismiss } = useToast();

  if (!context) {
    throw new Error("ToastViewport must be used within a ToastProvider");
  }

  const toasts = context;
  return createPortal(
    <div role="status" aria-live="polite" className={styles.viewport}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${toast.variant === "success" ? styles.success : styles.error}`}
        >
          <span>{toast.variant === "success" ? "success" : "failed"}</span>
          <p className={styles.message}>{toast.message}</p>
          <button onClick={() => dismiss(toast.id)} type="button" className={styles.closeButton}>
            &times;
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProp[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prevToast) => {
      return prevToast.filter((toast) => toast.id !== id);
    });
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = crypto.randomUUID();
      setToasts((prevToasts) => [...prevToasts, { id: id, message: message, variant: variant }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);
  return (
    <ToastAPIContext.Provider value={api}>
      <ToastStateContext.Provider value={toasts}>
        {children}
        <ToastViewport />
      </ToastStateContext.Provider>
    </ToastAPIContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastAPIContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
