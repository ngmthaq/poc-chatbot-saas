import { userSessionAtom } from '@/stores';
import { Typography } from '@mui/material';
import { useAtomValue } from 'jotai';
import { MainTemplate } from '../templates';

export function HomePage() {
  const session = useAtomValue(userSessionAtom);

  return (
    <MainTemplate title="Call Center Agent">
      <Typography variant="body1">
        {session ? `Welcome, ${session.displayName}` : 'Welcome to Call Center Agent'}
      </Typography>
    </MainTemplate>
  );
}
