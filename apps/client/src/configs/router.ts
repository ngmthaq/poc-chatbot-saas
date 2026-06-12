import { routeTree } from '@/generated/routeTree.gen';
import { createRouter } from '@tanstack/react-router';

export const router = createRouter({ routeTree });
