"use client";
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const ReactQueryDevtools = dynamic(() => import('@tanstack/react-query-devtools').then(m => ({ default: m.ReactQueryDevtools })), { ssr: false });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <QueryClientProvider client={client}>
              <Header />
              <main className="container py-8">
                {children}
              </main>
              <Footer />
              {process.env.NODE_ENV === 'development' ? (
                <ReactQueryDevtools initialIsOpen={false} position="bottom" />
              ) : null}
            </QueryClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
