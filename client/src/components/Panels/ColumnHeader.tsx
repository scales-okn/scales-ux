import React from "react";

import { css } from "@emotion/css";

import { useHelpTexts } from "store/helpTexts";

import CustomTooltip from "components/HelpTextTooltip";

const ColumnHeader = ({
  title,
  dataKey,
  withTooltip = false,
}: {
  title: string;
  dataKey: string;
  withTooltip?: boolean;
}) => {
  const { helpTexts } = useHelpTexts();

  const matchHelpText = (key) => {
    return helpTexts?.find((helpText) => helpText.slug === key);
  };

  const helpText = matchHelpText(dataKey);

  const headerStyle = css`
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.03333em;
    line-height: 1.6;
    color: rgba(0, 0, 0, 0.5);
    cursor: default;
  `;

  return withTooltip && helpText?.description ? (
    <CustomTooltip helpText={helpText}>
      <span className={`tooltipSpan ${headerStyle}`}>{title}</span>
    </CustomTooltip>
  ) : (
    <span className={`tooltipSpan ${headerStyle}`}>{title}</span>
  );
};

export default ColumnHeader;
