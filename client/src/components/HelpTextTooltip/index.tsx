import React, { ReactElement, ReactNode } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { userSelector } from "src/store/auth";

import { tooltipTitleStyles } from "../Filters/styles";

export const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "white",
    color: "black",
    maxWidth: 400,
    border: "1px solid #dadde9",
    boxShadow: theme.shadows[3],
    padding: "24px",
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
  const { role } = useSelector(userSelector);
  const isAdmin = role === "admin";

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
    <div className={`tooltip-title ${tooltipTitleStyles}`}>
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
    </div>
  );

  return (
    <CustomTooltip title={title} placement="bottom-start">
      {children}
    </CustomTooltip>
  );
};

export default FilterTooltip;
