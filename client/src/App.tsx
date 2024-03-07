import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useHelpTexts } from "./store/helpTexts";

import { ErrorBoundary } from "react-error-boundary";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button, hexToRgb, Box } from "@mui/material";
import ReactGA from "react-ga4";

import { useSessionUser } from "./store/auth";
import AppRoutes from "./AppRoutes";
import PageLayout from "./components/PageLayout";
import Notifications from "src/components/Notifications";

const theme = createTheme({
  palette: {
    primary: {
      main: hexToRgb("#4c79db"),
      dark: hexToRgb("#0b44bfd2"),
    },
    success: {
      main: hexToRgb("#099E0F"),
      dark: hexToRgb("#087e0c"),
    },
    error: {
      main: hexToRgb("#EB3C1A"),
      dark: hexToRgb("#c2192c"),
    },
    info: {
      main: hexToRgb("#915edd"),
      dark: hexToRgb("#a268f9"),
    },
  },
});

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div role="alert">
      <div
        style={{
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
        <h6 style={{ marginBottom: "36px" }}>{error.message}</h6>
        <Button variant="contained" onClick={resetErrorBoundary}>
          Try again
        </Button>
      </div>
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
