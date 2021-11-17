import React, { FunctionComponent, ReactNode } from "react";
import { SpinnerProps, Spinner } from "react-bootstrap";

interface Props {
  isVisible: boolean;
  children?: ReactNode;
}

const Loader: FunctionComponent<Props> = ({
  isVisible = false,

  children,
}: Props) => {
  <Spinner animation="border" variant="" />;
};

export default Loader;
