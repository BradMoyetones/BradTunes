import './assets/main.css'
// Supports weights 100-900
import '@fontsource-variable/onest';

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import { Toaster } from './components/ui/sonner';
import { DataProvider, MusicPathProvider, PlayerControllerProvider, ThemeProvider, VersionProvider } from './contexts';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark">
        <VersionProvider>
          <MusicPathProvider>
            <DataProvider>
              <PlayerControllerProvider>
                <RouterProvider router={router} />
                <Toaster />
              </PlayerControllerProvider>
            </DataProvider>
          </MusicPathProvider>
        </VersionProvider>
    </ThemeProvider>
  </React.StrictMode>
)
