import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { authSelector } from "./store/auth";
import { useHelpTexts } from "./store/helpTexts";

import { ErrorBoundary } from "react-error-boundary";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button, hexToRgb } from "@mui/material";

import PageLayout from "./components/PageLayout";
import DocumentPage from "src/pages/DocumentPage";
import SignInPage from "src/pages/SignInPage";
import SignUpPage from "src/pages/SignUpPage";
import NotebooksPage from "src/pages/NotebooksPage";
import NotebookPage from "src/pages/NotebookPage";
import EmailVerificationPage from "src/pages/EmailVerificationPage";
import ForgotPasswordPage from "src/pages/ForgotPasswordPage";
import ResetPasswordPage from "src/pages/ResetPasswordPage";
import Notifications from "src/components/Notifications";
import Ring from "src/pages/RingsPage/Ring";
import Admin from "src/pages/AdminPage";

const theme = createTheme({
  palette: {
    primary: {
      main: hexToRgb("#0e54ebd3"),
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
  const { user } = useSelector(authSelector);
  const requireAuth = (element) => {
    if (!user) {
      return <Navigate to="/sign-in" />;
    }

    return element;
  };

  useEffect(() => {
    if (user) getHelpTexts();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            window.location.reload();
          }}
        >
          <Notifications />
          <BrowserRouter>
            <PageLayout>
              <Routes>
                <Route path="/" element={requireAuth(<NotebooksPage />)} />
                <Route
                  path="/notebooks/:notebookId"
                  element={requireAuth(<NotebookPage />)}
                />
                <Route
                  path="/document/:ringId/:ringVersion/:entityType/:docId"
                  element={<DocumentPage />}
                />
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPasswordPage />}
                />
                <Route
                  path="/verify-email/:token"
                  element={<EmailVerificationPage />}
                />

                {/* Admin Routes */}
                <Route path="/admin/users" element={requireAuth(<Admin />)} />
                <Route
                  path="/admin/feedback"
                  element={requireAuth(<Admin />)}
                />
                <Route
                  path="/admin/help-texts/:helpTextSlug?"
                  element={requireAuth(<Admin />)}
                />
                <Route path="/admin/rings" element={requireAuth(<Admin />)} />
                <Route
                  path="/admin/rings/create"
                  element={requireAuth(<Ring />)}
                />
                <Route
                  path="/admin/rings/:ringId"
                  element={requireAuth(<Ring />)}
                />
                <Route
                  path="/admin/*"
                  element={<Navigate to="/admin/rings" replace />}
                />

                {/* Default Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PageLayout>
          </BrowserRouter>
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
};

export default App;
