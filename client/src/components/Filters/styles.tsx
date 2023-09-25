import { css } from "@emotion/css";

export const filterContainerStyles = css`
  background-color: white;
  padding: 24px;
  position: relative;
  display: flex;
  align-items: center;

  .filters {
    max-width: calc(100% - 150px);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
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
    position: relative;

    .rangeLabel {
      position: absolute;
      top: -9px;
      left: 10px;
      background-color: white;
      color: rgba(0, 0, 0, 0.6);
      font-size: 12px;
      z-index: 12;
      padding: 0 4px;
    }

    .react-datetimerange-picker {
      height: 56px;
    }

    .react-datetimerange-picker__wrapper {
      border-radius: 0 4px 4px 0;
      padding: 10px;
      border: 1px solid lightgrey;
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
