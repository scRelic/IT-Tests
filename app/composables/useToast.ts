type ToastVariant = "info" | "success" | "error";

export type ToastPayload = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

export type ToastItem = ToastPayload & {
  id: string;
};

const buildId = () => `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export const useToast = () => {
  const toasts = useState<ToastItem[]>("app_toasts", () => []);

  const push = (payload: ToastPayload) => {
    const toast: ToastItem = {
      id: buildId(),
      variant: "info",
      ...payload,
    };

    toasts.value = [...toasts.value, toast];
    return toast.id;
  };

  const dismiss = (id: string) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  };

  const clear = () => {
    toasts.value = [];
  };

  return {
    toasts,
    push,
    dismiss,
    clear,
  };
};
