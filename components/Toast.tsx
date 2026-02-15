'use client';

import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    closing?: boolean;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, closing: true } : t))
        );
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 250);
    }, []);

    const toast = useCallback(
        (message: string, type: ToastType = 'info') => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            setToasts((prev) => [...prev, { id, message, type }]);
            setTimeout(() => removeToast(id), 4000);
        },
        [removeToast]
    );

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
    };

    const borderColors = {
        success: 'border-l-emerald-400',
        error: 'border-l-red-400',
        info: 'border-l-blue-400',
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl glass-card border-l-4 ${borderColors[t.type]} min-w-[300px] max-w-[420px] ${t.closing ? 'animate-toast-out' : 'animate-toast-in'}`}
                    >
                        {icons[t.type]}
                        <p className="flex-1 text-sm font-medium text-foreground">
                            {t.message}
                        </p>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
