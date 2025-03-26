import './assets/main.css'
// Supports weights 100-900
import '@fontsource-variable/onest';

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import { ThemeProvider } from './components/theme-provider'
import { DataProvider } from './contexts/DataProvider';
import { Toaster } from './components/ui/sonner';
import { PlayerProvider } from './contexts/PlayerProvider';
import { PlayerManagerProvider } from './contexts/PlayerManagerContext';
import { VersionProvider } from './contexts/VersionContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" defaultColor='Green' storageKey="vite-ui-theme">
      <PlayerManagerProvider>
        <PlayerProvider>
          <DataProvider>
            <VersionProvider>
              <RouterProvider router={router} />
              <Toaster />
            </VersionProvider>
          </DataProvider>
        </PlayerProvider>
      </PlayerManagerProvider>
    </ThemeProvider>
  </React.StrictMode>
)
