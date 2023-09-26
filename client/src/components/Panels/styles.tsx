import { css } from "@emotion/css";

export const panelHeaderStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 4px 4px 0 0;
  box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.06);
  padding: 1rem;
  position: relative;
  width: 100%;
  z-index: 1;
  height: 80px;

  .buttonRow {
    display: flex;
    align-items: center;
  }
`;
