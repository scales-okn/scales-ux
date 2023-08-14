import React, { FunctionComponent } from "react";
import { Route } from "react-router-dom";
import { authSelector } from "../store/auth";
import { useSelector } from "react-redux";
import SignInPage from "pages/SignInPage";

interface Props {
  path: string;
  element?: JSX.Element;
}

const ProtectedRoute: FunctionComponent<Props> = ({ path, element }) => {
  const { user } = useSelector(authSelector);

  if (user) {
    return <Route path={path} element={element} />;
  } else {
    return <Route element={<SignInPage />} />;
  }
};

export default ProtectedRoute;
