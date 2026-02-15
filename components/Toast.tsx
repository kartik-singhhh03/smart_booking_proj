'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => { } });
export const useToast = () => useContext(ToastContext);

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
    exiting: boolean;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

        setTimeout(() => {
            setToasts((prev) =>
                prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
            );
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 300);
        }, 4000);
    }, []);

    const dismiss = (id: number) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
        );
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
    };

    const icons = {
        success: CheckCircle2,
        error: AlertCircle,
        info: Info,
    };

    const styles = {
        success: 'bg-success-bg border-success text-success',
        error: 'bg-destructive-bg border-destructive text-destructive',
        info: 'bg-card border-border text-foreground',
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 pointer-events-none">
                {toasts.map((t) => {
                    const Icon = icons[t.type];
                    return (
                        <div
                            key={t.id}
                            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sage-md min-w-[280px] max-w-[380px] ${styles[t.type]}`}
                            style={{
                                animation: t.exiting ? 'toast-out 0.3s ease forwards' : 'toast-in 0.4s ease forwards',
                            }}
                        >
                            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                            <span className="text-sm font-medium flex-1">{t.message}</span>
                            <button
                                onClick={() => dismiss(t.id)}
                                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
