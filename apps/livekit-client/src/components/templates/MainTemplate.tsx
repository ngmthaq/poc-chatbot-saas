import { PageHeader } from '@/components/molecules/PageHeader';
import { Box, Container } from '@mui/material';
import type { ReactNode } from 'react';

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
