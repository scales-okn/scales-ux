import React, { FunctionComponent } from "react";
import { Redirect, Route } from "react-router-dom";
import { authSelector } from "../store/auth";
import { useSelector } from "react-redux";

interface Props {
  component: React.ComponentType<any>;
  [key: string]: any;
}

const ProtectedRoute: FunctionComponent<Props> = ({ component: Component, ...restOfProps }) => {
  const { user } = useSelector(authSelector);

  return <Route {...restOfProps} render={(props) => (user ? <Component {...props} /> : <Redirect to="/sign-up" />)} />;
};

export default ProtectedRoute;
