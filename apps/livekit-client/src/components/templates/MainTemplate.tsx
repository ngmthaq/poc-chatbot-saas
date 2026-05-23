import { Box, Container } from '@mui/material';
import type { ReactNode } from 'react';
import { PageHeader } from '../molecules';

type MainTemplateProps = {
  title: string;
  children: ReactNode;
};

export function MainTemplate({ title, children }: MainTemplateProps) {
  return (
    <Box>
      <PageHeader title={title} />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
