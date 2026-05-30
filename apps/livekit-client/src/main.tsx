import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { router } from './configs';
import { logger } from './helpers';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
} else {
  logger.error('Main', 'Root element not found');
  document.body.innerHTML = 'Something went wrong. Please try again later.';
}
