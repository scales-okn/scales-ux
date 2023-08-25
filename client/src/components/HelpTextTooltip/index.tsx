import React from "react";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { userSelector } from "store/auth";
import { useSelector } from "react-redux";
import { tooltipTitleStyles } from "../Filters/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link } from "react-router-dom";

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
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
};

const FilterTooltip = ({ helpText }: FilterTooltipT) => {
  const { role } = useSelector(userSelector);
  const isAdmin = role === "admin";

  const { slug, description, examples, options, links } = helpText;

  const formatMultiple = (options, isLinks = false) => {
    const wrapper = (option) => {
      return isLinks ? (
        <p key={option}>
          <a href={option}>{option}</a>
        </p>
      ) : (
        <li>
          <p key={option}>{option}</p>
        </li>
      );
    };

    const optionsArray = options.split(",");
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
      <VisibilityIcon />
    </CustomTooltip>
  );
};

export default FilterTooltip;
