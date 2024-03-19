import React, { ReactElement, ReactNode } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { Box, useTheme } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { sessionUserSelector } from "src/store/auth";

export const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "white",
    color: "black",
    maxWidth: 400,
    border: "1px solid #dadde9",
    boxShadow: theme.shadows[3],
    padding: "12px 24px",
    maxHeight: "500px",
    overflowY: "auto",
  },
}));

type FilterTooltipT = {
  helpText: Record<string, unknown>;
  children?: ReactElement & ReactNode;
};

const FilterTooltip = ({
  helpText,
  children = <VisibilityIcon />,
}: FilterTooltipT) => {
  const { role } = useSelector(sessionUserSelector);
  const isAdmin = role === "admin";

  const theme = useTheme();

  const {
    slug,
    description,
    examples,
    options,
    links,
  }: {
    slug?: string;
    description?: string;
    examples?: string;
    options?: string;
    links?: string;
  } = helpText || {};

  if (!description) return null;

  const formatMultiple = (options, isLinks = false) => {
    const wrapper = (option) => {
      const appendHttp = (link) => {
        if (!link.includes("http")) {
          return `https://${link}`;
        }
        return link;
      };

      return isLinks ? (
        <p key={option}>
          <a className="optionLink" href={appendHttp(option)}>
            {option}
          </a>
        </p>
      ) : (
        <li key={option}>
          <p>{option}</p>
        </li>
      );
    };

    const optionsArray = options.split("!!");
    return <ul>{optionsArray.map((option) => wrapper(option))}</ul>;
  };

  const title = (
    <Box
      sx={{
        "& h5": {
          color: theme.palette.info.dark,
          fontWeight: 700,
          marginBottom: "12px",
          fontSize: "16px",
        },
        "& p": {
          fontSize: "14px",
        },
        "& ul": {
          paddingLeft: "10px",
        },
        "& .optionLink": {
          marginLeft: "-10px",
        },
        "& section:not(:last-child)": {
          marginBottom: "32px",
        },
      }}
    >
      {isAdmin && (
        <section>
          <h5>Slug:</h5>
          <Link to={`/admin/help-texts/${slug}`}>
            <p>{slug}</p>
          </Link>
        </section>
      )}
      <section>
        <h5>Description:</h5>
        <p>{description}</p>
      </section>
      {examples && (
        <section>
          <h5>Examples:</h5>
          {formatMultiple(examples)}
        </section>
      )}
      {options && (
        <section>
          <h5>Options:</h5>
          {formatMultiple(options)}
        </section>
      )}
      {links && (
        <section>
          <h5>Links:</h5>
          {formatMultiple(links, true)}
        </section>
      )}
    </Box>
  );

  return (
    <CustomTooltip title={title} placement="bottom-start">
      {children}
    </CustomTooltip>
  );
};

export default FilterTooltip;
