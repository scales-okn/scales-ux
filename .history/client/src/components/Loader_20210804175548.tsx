import React, { FunctionComponent, ReactNode } from "react";
import { SpinnerProps, Spinner } from "react-bootstrap";

interface Props {
  isVisible: boolean;
  children: JSX.Element;
}

const Loader: FunctionComponent<Props> = ({
  isVisible = false,

  children,
}: Props) => {
  if (isVisible) {
    return <>a</>;
  }

  return children;
};

export default Loader;
