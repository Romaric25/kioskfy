"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Temps de mise en cache par défaut
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      // Retry par défaut
      retry: (failureCount, error: any) => {
        // Ne pas retry sur les erreurs 4xx (client)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry jusqu'à 3 fois pour les autres erreurs
        return failureCount < 3;
      },
      // Refetch sur focus de la fenêtre
      refetchOnWindowFocus: false,
      // Refetch sur reconnexion
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry par défaut pour les mutations
      retry: (failureCount, error: any) => {
        // Ne pas retry sur les erreurs 4xx
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry une seule fois pour les mutations
        return failureCount < 1;
      },
    },
  },
})

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <React.ViewTransition enter="slide-in" exit="slide-out">
            <NuqsAdapter>{children}</NuqsAdapter>
          </React.ViewTransition>
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster position="top-right" reverseOrder={false} gutter={12} containerClassName="z-50" containerStyle={{ top: 20, right: 20 }} />
        </NextThemesProvider>
    </QueryClientProvider>
  );
}