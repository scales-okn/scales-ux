import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { Button } from "react-bootstrap";
import { ErrorBoundary } from "react-error-boundary";

import { authSelector } from "./store/auth";
import { useSelector } from "react-redux";

import DocumentPage from "pages/DocumentPage";
import UsersPage from "pages/UsersPage";
import FeedbackPage from "pages/FeedbackPage";
import SignInPage from "pages/SignInPage";
import SignUpPage from "pages/SignUpPage";
import ProfilePage from "pages/ProfilePage";
import NotebooksPage from "pages/NotebooksPage";
import NotebookPage from "pages/NotebookPage";
import EmailVerificationPage from "pages/EmailVerificationPage";
import ForgotPasswordPage from "pages/ForgotPasswordPage";
import ResetPasswordPage from "pages/ResetPasswordPage";
import RingsPage from "pages/RingsPage";
import Notifications from "components/Notifications";
import Ring from "pages/RingsPage/Ring";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
};

const App = () => {
  const { user } = useSelector(authSelector);
  const requireAuth = (element) => {
    if (!user) {
      return <Navigate to="/sign-in" />;
    }

    return element;
  };

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
          <Routes>
            <Route path="/" element={requireAuth(<NotebooksPage />)} />
            <Route path="/users" element={requireAuth(<UsersPage />)} />
            <Route path="/feedback" element={requireAuth(<FeedbackPage />)} />
            <Route path="/rings" element={requireAuth(<RingsPage />)} />
            <Route path="/profile" element={requireAuth(<ProfilePage />)} />
            <Route path="/rings" element={requireAuth(<NotebooksPage />)} />
            <Route path="/rings/create" element={requireAuth(<Ring />)} />
            <Route path="/rings/:ringId" element={requireAuth(<Ring />)} />
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
            {/* <Route element={<Redirect to="/" />} /> */}
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
};

export default App;
