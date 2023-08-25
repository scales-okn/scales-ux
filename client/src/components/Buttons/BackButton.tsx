import React from "react";
import { css } from "@emotion/css";
import { Button } from "react-bootstrap";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BackButton = ({ onClick }) => {
  const styles = css`
    display: flex;
    align-items: center;
    cursor: pointer;
    color: white;
    background: var(--main-purple);
    padding: 8px 16px 8px 8px;
    border-radius: 0 4px 4px 0;
    position: absolute;
    top: 80px;
    left: 0;
    transition: background 0.2s ease-in-out;

    &:hover {
      background: var(--main-purple-light);
    }
  `;

  return (
    <div onClick={onClick} className={`backButton ${styles}`}>
      <ArrowBackIcon sx={{ fontSize: "22px" }} />
      <div style={{ marginLeft: "6px" }}>Back</div>
    </div>
  );
};

export default BackButton;
