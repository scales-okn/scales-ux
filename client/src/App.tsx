import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useHelpTexts } from "./store/helpTexts";

import { ErrorBoundary } from "react-error-boundary";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button, hexToRgb, Box, Typography } from "@mui/material";
import ReactGA from "react-ga4";

import { useSessionUser } from "./store/auth";
import AppRoutes from "./AppRoutes";
import PageLayout from "./components/PageLayout";
import Notifications from "src/components/Notifications";

const theme = createTheme({
  palette: {
    primary: {
      main: hexToRgb("#29d4c0"),
      dark: hexToRgb("#1a8679"),
    },
    secondary: {
      main: hexToRgb("#96497e"),
      dark: hexToRgb("#582b4a"),
    },
    success: {
      main: hexToRgb("#98bf20"),
      dark: hexToRgb("#25740c"),
    },
    error: {
      main: hexToRgb("#ff7000"),
      dark: hexToRgb("#bf5400"),
    },
    info: {
      main: hexToRgb("#29d4c0"),
      dark: hexToRgb("#284666"),
      light: hexToRgb("#caf0ec"),
    },
  },
});

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div role="alert">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          maxWidth: "500px",
          width: "90%",
          margin: "120px auto",
          textAlign: "center",
        }}
      >
        <h3>Something went wrong:</h3>
        <Typography variant="h6" sx={{ marginBottom: "36px" }}>
          {error.message}
        </Typography>
        <Button variant="contained" onClick={resetErrorBoundary}>
          Try again
        </Button>
      </Box>
    </div>
  );
};

const App = () => {
  const { getHelpTexts } = useHelpTexts();
  const sessionUser = useSessionUser();

  useEffect(() => {
    if (sessionUser) getHelpTexts();
  }, [sessionUser]); // eslint-disable-line react-hooks/exhaustive-deps

  ReactGA.initialize([
    {
      trackingId: "G-02JQP9G088",
      gaOptions: {
        debug: true,
      },
    },
  ]);

  return (
    <ThemeProvider theme={theme}>
      <Box className="app">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            window.location.reload();
          }}
        >
          <Notifications />
          <BrowserRouter>
            <PageLayout>
              <AppRoutes />
            </PageLayout>
          </BrowserRouter>
        </ErrorBoundary>
      </Box>
    </ThemeProvider>
  );
};

export default App;
