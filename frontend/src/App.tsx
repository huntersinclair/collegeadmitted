import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to College Admitted
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Your AI-powered college application analysis platform
        </Typography>
      </Container>
    </ThemeProvider>
  );
};

export default App; 