import { css } from "@emotion/css";

export const styles = css`
  background-color: white;
  padding: 24px;
  position: relative;
  display: flex;

  .filters {
    max-width: calc(100% - 200px);
  }
`;

export const tooltipTitleStyles = css`
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
`;
