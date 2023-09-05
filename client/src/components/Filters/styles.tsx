import { css } from "@emotion/css";

export const filterContainerStyles = css`
  background-color: white;
  padding: 24px;
  position: relative;
  display: flex;
  align-items: center;

  .filters {
    max-width: calc(100% - 200px);
    display: flex;
    align-items: center;
  }
`;

export const filterStyles = css`
  .filterItem {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    background-color: white;
    margin-right: 16px;
  }

  .closeIcon {
    cursor: pointer;
    margin-left: 4px;
  }

  .switchElement {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid lightgrey;
    padding: 0 24px;
  }

  .dateRangePickerElement {
    height: 56px;

    .react-datetimerange-picker {
      height: 56px;
    }

    .react-datetimerange-picker__wrapper {
      padding: 10px;
    }
  }
`;

export const filterTypeStyles = css`
  height: 56px;
  width: 56px;
  border: 1px solid lightgray;
  border-right: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px 0 0 4px;
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
