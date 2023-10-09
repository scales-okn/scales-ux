import React from "react";
import { useSelector } from "react-redux";
import { Route, Routes, Navigate } from "react-router-dom";
import { authSelector } from "./store/auth";

import DocumentPage from "src/pages/DocumentPage";
import SignInPage from "src/pages/SignInPage";
import SignUpPage from "src/pages/SignUpPage";
import NotebooksPage from "src/pages/NotebooksPage";
import NotebookPage from "src/pages/NotebookPage";
import EmailVerificationPage from "src/pages/EmailVerificationPage";
import ForgotPasswordPage from "src/pages/ForgotPasswordPage";
import ResetPasswordPage from "src/pages/ResetPasswordPage";
import Ring from "src/pages/RingsPage/Ring";
import Admin from "src/pages/AdminPage";
import { useGoogleAnalytics } from "./hooks/useGAPageView";

const AppRoutes = () => {
  const { user } = useSelector(authSelector);

  const requireAuth = (element) => {
    if (!user) {
      return <Navigate to="/sign-in" />;
    }

    return element;
  };

  useGoogleAnalytics();

  return (
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
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<EmailVerificationPage />} />

      {/* Admin Routes */}
      <Route path="/admin/users" element={requireAuth(<Admin />)} />
      <Route path="/admin/feedback" element={requireAuth(<Admin />)} />
      <Route
        path="/admin/help-texts/:helpTextSlug?"
        element={requireAuth(<Admin />)}
      />
      <Route path="/admin/rings" element={requireAuth(<Admin />)} />
      <Route path="/admin/rings/create" element={requireAuth(<Ring />)} />
      <Route path="/admin/rings/:ringId" element={requireAuth(<Ring />)} />
      <Route path="/admin/*" element={<Navigate to="/admin/rings" replace />} />

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
