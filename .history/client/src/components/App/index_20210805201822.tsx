import React, { FunctionComponent } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { AuthProvider, PrivateRoute } from "react-auth-kit";
import HomePage from "../HomePage";
import AdminDashboardPage from "../Admin/DashboardPage";
import AdminUsersPage from "../Admin/UsersPage";
import SignInPage from "../SignInPage";
import SignUpPage from "../SignUpPage";
import ProfilePage from "../ProfilePage";
import NotebooksPage from "../NotebooksPage";
import NotebookPage from "../NotebookPage";
import EmailVerificationPage from "../EmailVerificationPage";
import ForgotPasswordPage from "../ForgotPasswordPage";
import ResetPasswordPage from "../ResetPasswordPage";
import "./App.scss";

const App: FunctionComponent = () => {
  return (
    <div className="app">
      <AuthProvider
        authType="localstorage"
        authName="satyrn_auth"
        cookieDomain={window.location.hostname}
        cookieSecure={window.location.protocol === "https:"}
      >
        <BrowserRouter>
          <Switch>
            <PrivateRoute
              exact
              path="/"
              component={HomePage}
              loginPath="/sign-in"
            />
            <PrivateRoute
              exact
              path="/admin"
              component={AdminDashboardPage}
              loginPath="/sign-in"
            />
            <PrivateRoute
              exact
              path="/admin/dashboard"
              component={AdminDashboardPage}
              loginPath="/sign-in"
            />
            <PrivateRoute
              exact
              path="/admin/users"
              component={AdminUsersPage}
              loginPath="/sign-in"
            />
            <PrivateRoute
              exact
              path="/profile"
              component={ProfilePage}
              loginPath="/sign-in"
            />
            <PrivateRoute
              exact
              path="/notebooks"
              component={NotebooksPage}
              loginPath="/sign-in"
            />
            <PrivateRoute
              exact
              path="/notebook"
              component={NotebookPage}
              loginPath="/sign-in"
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
      </AuthProvider>
    </div>
  );
};

export default App;
