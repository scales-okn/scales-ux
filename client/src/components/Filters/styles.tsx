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
    z-index: 100;

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
