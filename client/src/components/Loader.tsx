/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { CircularProgress } from "@mui/material";

interface LoaderT {
  isVisible: boolean;
  children?: any;
  contentHeight?: string;
  size?: number;
}

const Loader = ({
  isVisible = false,
  size = 40,
  children,
  contentHeight,
}: LoaderT) => {
  if (isVisible) {
    return (
      <div
        className="d-flex justify-content-center p-2"
        style={{
          height: contentHeight || "100%",
        }}
      >
        <CircularProgress className="align-self-center" size={size} />
      </div>
    );
  }

  return children;
};

export default Loader;
