import { css } from "@emotion/css";

export const detailStyles = css`
  min-width: 200px;

  h5 {
    color: var(--main-purple-light);
  }

  p {
    font-size: 14px;
  }

  section {
    margin-bottom: 24px;
  }

  .buttonRow {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 48px;

    button {
      color: white;
    }
  }
`;
