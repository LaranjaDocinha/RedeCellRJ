import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { showReportDialog } from "@sentry/react"; // Importar showReportDialog
import './index.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './i18n'; // Importar a configuração do i18n
import App from './App';
import reportWebVitals from './reportWebVitals';


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SoundProvider } from './contexts/SoundContext';
import { AnimationProvider } from './contexts/CartAnimationContext'; // Import AnimationProvider
import { CartProvider } from './contexts/CartContext'; // Import CartProvider
import { PermissionProvider } from './contexts/PermissionContext'; // Import PermissionProvider

import * as serviceWorkerRegistration from './serviceWorkerRegistration.ts';

Sentry.init({
  dsn: "https://b0aca941c1343c1d9f95a444a0c17e6f@o4510040732073984.ingest.us.sentry.io/4510040741969920",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", "http://localhost:3001/api"],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>An unexpected error has occurred.</p>}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PermissionProvider> {/* Add PermissionProvider */}
            <SoundProvider>
              <NotificationProvider>
                <AnimationProvider> {/* Add AnimationProvider */}
                  <CartProvider> {/* Add CartProvider */}
                    <App />
                  </CartProvider>
                </AnimationProvider>
              </NotificationProvider>
            </SoundProvider>
          </PermissionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: registration => {
    const waitingServiceWorker = registration.waiting;
    if (waitingServiceWorker) {
      // Ask the user to refresh to get the new version.
      // You can show a toast or a dialog here.
      console.log("New content is available and will be used when all tabs for this page are closed.");
      // To force the update, you can use:
      // waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  },
  onSuccess: registration => {
    console.log("Content is cached for offline use.", registration);
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
