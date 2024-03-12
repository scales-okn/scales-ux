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
      main: hexToRgb("#4e77cf"),
      dark: hexToRgb("#1e3c7e"),
    },
    success: {
      main: hexToRgb("#1e9722"),
      dark: hexToRgb("#1a7f1d"),
    },
    error: {
      main: hexToRgb("#c0462e"),
      dark: hexToRgb("#9c1323"),
    },
    info: {
      main: hexToRgb("#7e56b9"),
      dark: hexToRgb("#6d4b9f"),
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
