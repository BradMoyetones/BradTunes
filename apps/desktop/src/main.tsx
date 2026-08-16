import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import router from '@/router';
import { ThemeProvider } from './components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster, TooltipProvider } from '@xtunes/ui';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ErrorBoundary>
                <TooltipProvider delay={0}>
                    <RouterProvider router={router} />
                    <Toaster />
                </TooltipProvider>
            </ErrorBoundary>
        </ThemeProvider>
    </React.StrictMode>
);
