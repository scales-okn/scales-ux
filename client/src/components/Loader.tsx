/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { CircularProgress } from "@mui/material";

interface LoaderT {
  isVisible: boolean;
  children?: any;
  contentHeight?: string;
  size?: number;
}

const Loader = ({ isVisible = false, size = 60, children }: LoaderT) => {
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        minHeight: isVisible ? "100px" : "0px",
        transition: ".2s all",
      }}
    >
      {isVisible && (
        <div
          style={{
            position: "absolute",
            zIndex: 1000,
            top: "40%",
            left: "50%",
          }}
        >
          <CircularProgress
            className="align-self-center"
            size={size}
            thickness={5}
          />
        </div>
      )}
      {children}
    </div>
  );

  return children;
};

export default Loader;
