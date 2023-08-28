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
  h5 {
    color: var(--main-purple);
    font-weight: 700;
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
  }

  ul {
    padding-left: 10px;
  }

  .optionLink {
    margin-left: -10px;
  }

  section:not(:last-child) {
    margin-bottom: 32px;
  }
`;
