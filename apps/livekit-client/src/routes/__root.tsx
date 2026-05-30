import { queryClient, theme } from '@/configs';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Provider as JotaiProvider } from 'jotai';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Outlet />
        </ThemeProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </JotaiProvider>
  );
}
