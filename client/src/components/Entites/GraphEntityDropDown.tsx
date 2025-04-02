// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useHelpTexts } from "src/store/helpTexts";

import { Box, Menu, MenuItem, ListItemText } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import FilterTooltip from "../HelpTextTooltip";
import { useRing } from "src/store/rings";
import { usePanel } from "src/store/panels";

type GraphEntityT = {
  uri: string;
  name: string;
};

type GraphEntityDropDownProps = {
  entity: GraphEntityT;
  entities: GraphEntityT[];
  setEntity: (arg: GraphEntityT) => void;
  disabled?: boolean;
  panelId: string;
};

const GraphEntityDropDown = ({
  entity,
  entities,
  setEntity,
  disabled,
  panelId,
}: GraphEntityDropDownProps) => {
  const { panel, filters, setPanelFilters, updatePanel } = usePanel(panelId);
  // ignore the following error
  // eslint-disable-next-line
  const { ring, info, graph } = useRing(panel.ringRid);
  console.log(ring, info, graph);
  useEffect(() => {
    const getRingInfo = async () => {
      const response = await makeRequest.get(
        `/proxy/rings/${panel.ringRid}/${panel.ringVersion}`,
      );
      console.dir(response);
    };
    getRingInfo();
  }, []);
  // const resetFilterState = (input) => {
  //   try {
  //     if (input) {
  //       // when changing filter type, reset the value
  //       const { type: dataType } = getFilterOptionsByKey(input.key) || {};

  //       setFilter({
  //         ...filter,
  //         type: input.key,
  //         value: dataType === "boolean" ? "false" : "",
  //       });
  //     }
  //   } catch (error) {
  //     console.warn(error); // eslint-disable-line no-console
  //   }
  // };

  // const filtersToRender = getFiltersNormalized()
  //   ?.filter(
  //     (x) => x.nicename !== "Case Name",
  //   ) /* hack due to complaints from the docket-preview pane when i tried to change these fields' ring settings */
  //   .map((filterInput) => {
  //     const { allowMultiple, key } = filterInput;
  //     if (
  //       allowMultiple === false &&
  //       filters.some((filter: FilterT) => filter.type === key)
  //     ) {
  //       return { ...filterInput, disabled: true };
  //     }

  //     return filterInput;
  //   })
  //   .sort((a, b) => a.nicename.localeCompare(b.nicename));

  // const matchHelpText = (key) => {
  //   return helpTexts?.find((helpText) => helpText.slug === key);
  // };

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
    <Box
      sx={{
        minHeight: "56px",
        height: "100%",
        width: "36px",
        border: "1px solid lightgray",
        borderRight: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "4px 0 0 4px",
      }}
    >
      <Box
        sx={{
          cursor: disabled ? "not-allowed" : "pointer",
          height: "100%",
          width: "100%",
          minHeight: "54px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px 0 0 4px",
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
          <ListItemText
            sx={{
              color: "text.secondary",
              fontSize: "0.75rem",
              marginLeft: "1rem",
            }}
          >
            <small>Select a filter type...</small>
          </ListItemText>
        </MenuItem>
        {entities?.map(({ uri, name }) => {
          // const helpText = matchHelpText(key);

          return (
            <div key={uri}>
              <MenuItem
                onClick={() => {
                  setEntity({ uri, name });
                  // resetFilterState({ uri, nicename });
                  handleMenuClose();
                }}
                disabled={disabled}
              >
                <ListItemText
                  sx={{
                    color: disabled ? "text.secondary" : "",
                  }}
                >
                  {name}
                </ListItemText>
              </MenuItem>
            </div>
          );
        })}
      </Menu>
    </Box>
  );
};

export default GraphEntityDropDown;
