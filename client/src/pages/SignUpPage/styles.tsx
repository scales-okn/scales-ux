import { css } from "@emotion/css";

export const signUpPageStyles = css`
  .gridRow {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 40px;
    text-align: center;
  }

  .input {
    background: white;
    margin-bottom: 16px;
  }

  .buttonRow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;

    .tos {
      margin-bottom: 0;
    }
  }
`;
