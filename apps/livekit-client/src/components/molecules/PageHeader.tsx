import { AppBar, Toolbar, Typography } from '@mui/material';

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">{title}</Typography>
      </Toolbar>
    </AppBar>
  );
}
