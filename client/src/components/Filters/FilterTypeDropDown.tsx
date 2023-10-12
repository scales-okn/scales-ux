import React, { useState } from "react";
import { useHelpTexts } from "src/store/helpTexts";

import { Box, Menu, MenuItem, ListItemText } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import FilterTooltip from "../HelpTextTooltip";

import { filterTypeStyles } from "./styles";

type FilterT = {
  id: string;
  type: string;
  value: string | number;
};

type NormFilterT = {
  allowMultiple: boolean;
  autocomplete: boolean;
  disabled: boolean;
  desc: string;
  key: string;
  nicename: string;
  type: string;
};

type FilterTypeDropDownT = {
  filter: FilterT;
  filters: FilterT[];
  setFilter: (arg: Record<string, unknown>) => void;
  getFiltersNormalized: () => NormFilterT[];
  getFilterOptionsByKey: (type: string) => NormFilterT;
  disabled?: boolean;
};

const FilterTypeDropDown = ({
  filter,
  filters,
  getFiltersNormalized,
  getFilterOptionsByKey,
  setFilter,
  disabled,
}: FilterTypeDropDownT) => {
  // const { type } = filter;
  const { helpTexts } = useHelpTexts();

  // const filterOptions = getFilterOptionsByKey(type);

  // TODO: Can we remove this?
  // const [filterInput, setFilterInput] = useState<FilterColumn>({
  //   key: type,
  //   nicename: filterOptions?.nicename,
  // });

  const resetFilterState = (input) => {
    try {
      if (input) {
        // when changing filter type, reset the value
        const { type: dataType } = getFilterOptionsByKey(input.key) || {};

        setFilter({
          ...filter,
          type: input.key,
          value: dataType === "boolean" ? "false" : "",
        });
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
    }
  };

  const filtersToRender = getFiltersNormalized()
    ?.filter(
      (x) => x.nicename !== "Docket HTML" && x.nicename !== "Case Name",
    ) /* hack due to complaints from the docket-preview pane when i tried to change these fields' ring settings */
    .map((filterInput) => {
      const { allowMultiple, key } = filterInput;
      if (
        allowMultiple === false &&
        filters.some((filter: FilterT) => filter.type === key)
      ) {
        return { ...filterInput, disabled: true };
      }

      return filterInput;
    })
    .sort((a, b) => a.nicename.localeCompare(b.nicename));

  const matchHelpText = (key) => {
    return helpTexts?.find((helpText) => helpText.slug === key);
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={`filter-type ${filterTypeStyles}`}>
      <Box
        sx={{
          cursor: disabled ? "not-allowed" : "pointer",
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleMenuOpen}
      >
        <ArrowDropDownIcon sx={{ color: "royalblue" }} />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: "70vh",
            overflowY: "auto",
          },
        }}
        disableScrollLock={true}
      >
        <MenuItem>
          <ListItemText className="text-muted fs-6 ms-3">
            <small>Select a filter type...</small>
          </ListItemText>
        </MenuItem>
        {filtersToRender?.map(({ key, nicename, desc, disabled }) => {
          const helpText = matchHelpText(key);

          return (
            <div key={key}>
              <MenuItem
                onClick={() => {
                  // setFilterInput({ key, nicename });
                  resetFilterState({ key, nicename });
                  handleMenuClose();
                }}
                disabled={disabled}
              >
                <ListItemText className={disabled ? "text-muted" : ""}>
                  {nicename}
                </ListItemText>
                <>
                  {desc && (
                    <ListItemText className="text-muted fs-6">
                      <small>{desc}</small>
                    </ListItemText>
                  )}
                  {helpText && <FilterTooltip helpText={helpText} />}
                </>
              </MenuItem>
            </div>
          );
        })}
      </Menu>
    </div>
  );
};

export default FilterTypeDropDown;
