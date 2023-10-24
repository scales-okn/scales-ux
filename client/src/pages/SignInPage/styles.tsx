import { css } from "@emotion/css";

export const signInPageStyles = css`
  width: 80%;
  max-width: 500px;
  padding-top: 80px;
  margin: 0 auto;

  .gridRow {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 60px;
  }

  .input {
    background: white;
  }

  .buttonRow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    margin-top: 24px;
  }
`;
