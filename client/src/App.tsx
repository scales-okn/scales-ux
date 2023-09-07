import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { ErrorBoundary } from "react-error-boundary";

import { authSelector } from "./store/auth";
import { useSelector } from "react-redux";

import { useHelpTexts } from "./store/helpTexts";

import StandardButton from "src/components/Buttons/StandardButton";
import PageLayout from "./components/PageLayout";

import DocumentPage from "./pages/DocumentPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import NotebooksPage from "./pages/NotebooksPage";
import NotebookPage from "./pages/NotebookPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Notifications from "src/components/Notifications";
import Ring from "./pages/RingsPage/Ring";
import Admin from "./pages/AdminPage";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <StandardButton onClick={resetErrorBoundary}>Try again</StandardButton>
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
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
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
              <Route path="/admin/feedback" element={requireAuth(<Admin />)} />
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
  );
};

export default App;
