import { HomePage } from '@/components/pages';
import { LiveKitSessionProvider } from '@/components/providers';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LiveKitSessionProvider>
      <HomePage />
    </LiveKitSessionProvider>
  );
}
