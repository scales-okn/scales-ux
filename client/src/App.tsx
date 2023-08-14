import React, { FunctionComponent } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { Button } from "react-bootstrap";
import { ErrorBoundary } from "react-error-boundary";
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
import ProtectedRoute from "components/ProtectedRoute";
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

const App: FunctionComponent = () => {
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
          <Switch>
            <ProtectedRoute exact path="/" component={NotebooksPage} />
            <ProtectedRoute exact path="/users" component={UsersPage} />
            <ProtectedRoute exact path="/feedback" component={FeedbackPage} />
            <ProtectedRoute exact path="/rings" component={RingsPage} />
            <ProtectedRoute exact path="/profile" component={ProfilePage} />
            {/* <ProtectedRoute exact path="/notebooks" component={NotebooksPage} /> */}
            <ProtectedRoute exact path="/rings" component={NotebooksPage} />
            <ProtectedRoute exact path="/rings/create" component={Ring} />
            <ProtectedRoute exact path="/rings/:ringId" component={Ring} />
            <ProtectedRoute
              exact
              path="/notebooks/:notebookId"
              component={NotebookPage}
            />
            <ProtectedRoute
              exact
              path="/document/:ringId/:ringVersion/:entityType/:docId"
              component={DocumentPage}
            />
            <Route path="/sign-in" component={SignInPage} />
            <Route path="/sign-up" component={SignUpPage} />
            <Route path="/forgot-password" component={ForgotPasswordPage} />
            <Route
              path="/reset-password/:token"
              component={ResetPasswordPage}
            />
            <Route
              path="/verify-email/:token"
              component={EmailVerificationPage}
            />
            <Route component={() => <Redirect to="/" />} />
          </Switch>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
};

export default App;
