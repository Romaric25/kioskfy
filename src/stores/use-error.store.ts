import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export type ErrorMessage = {
    id: string;
    title?: string;
    message: string;
    type?: 'error' | 'warning' | 'info';
};

export const useErrorStore = create(
    combine(
        {
            errors: [] as ErrorMessage[],
        },
        (set) => ({
            addError: (error: Omit<ErrorMessage, 'id'>) =>
                set((state) => {
                    const exists = state.errors.some(
                        (e) => e.message === error.message && e.title === error.title
                    );
                    if (exists) return state;
                    return {
                        errors: [
                            ...state.errors,
                            { ...error, id: Math.random().toString(36).substring(7) },
                        ],
                    };
                }),
            removeError: (id: string) =>
                set((state) => ({
                    errors: state.errors.filter((error) => error.id !== id),
                })),
            clearErrors: () => set({ errors: [] }),
        })
    )
);
