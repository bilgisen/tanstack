import { useToastStore, type ToastMessage } from "../../store/toast";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          borderColor: "border-emerald-500/20",
          bgColor: "bg-emerald-950/20",
          progressColor: "bg-emerald-500",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          borderColor: "border-rose-500/20",
          bgColor: "bg-rose-950/20",
          progressColor: "bg-rose-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          borderColor: "border-amber-500/20",
          bgColor: "bg-amber-950/20",
          progressColor: "bg-amber-500",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
          borderColor: "border-blue-500/20",
          bgColor: "bg-blue-950/20",
          progressColor: "bg-blue-500",
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`pointer-events-auto flex flex-col overflow-hidden rounded-xl border ${styles.borderColor} ${styles.bgColor} backdrop-blur-md shadow-lg transition-all duration-300 animate-slide-in-right w-full`}
    >
      <div className="flex items-start gap-3 p-4">
        {styles.icon}
        <p className="text-sm font-medium text-zinc-200 flex-1 leading-relaxed">
          {toast.message}
        </p>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 rounded-lg p-0.5 hover:bg-zinc-800/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="h-0.5 w-full bg-zinc-800/40">
        <div
          className={`h-full ${styles.progressColor} rounded-full`}
          style={{
            animation: `shrink ${toast.duration || 4000}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}
