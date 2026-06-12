import { router } from '@/configs';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
