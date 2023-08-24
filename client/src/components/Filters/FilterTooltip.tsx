import React from "react";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { userSelector } from "store/auth";
import { useSelector } from "react-redux";
import { tooltipTitleStyles } from "./styles";
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
  },
}));

type FilterTooltipT = {
  helpText: Record<string, unknown>;
};

const FilterTooltip = ({ helpText }: FilterTooltipT) => {
  const { role } = useSelector(userSelector);
  const isAdmin = role === "admin";

  const { slug, description, examples, options, links } = helpText;

  const title = (
    <div className={`tooltip-title ${tooltipTitleStyles}`}>
      {isAdmin && (
        <section>
          <h5>Slug:</h5>
          <Link to={`/help-texts/${slug}`}>
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
          <p>{examples}</p>
        </section>
      )}
      {options && (
        <section>
          <h5>Options:</h5>
          <p>{options}</p>
        </section>
      )}
      {links && (
        <section>
          <h5>Links:</h5>
          <p>{links}</p>
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
