import { Box, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { AppButton } from '../atoms';

type JoinRoomFormProps = {
  onJoin: (identity: string, name?: string) => void;
  isPending: boolean;
  error: Error | null;
};

export function JoinRoomForm({ onJoin, isPending, error }: JoinRoomFormProps) {
  const [identity, setIdentity] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onJoin(identity, displayName || undefined);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Identity"
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          required
          fullWidth
          disabled={isPending}
        />
        <TextField
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth
          disabled={isPending}
        />
        {error !== null && (
          <Typography variant="body2" color="error">
            {error instanceof Error ? error.message : 'Failed to join room. Please try again.'}
          </Typography>
        )}
        <AppButton type="submit" variant="contained" disabled={!identity || isPending} fullWidth>
          {isPending ? <CircularProgress size={20} /> : 'Join Room'}
        </AppButton>
      </Stack>
    </Box>
  );
}
