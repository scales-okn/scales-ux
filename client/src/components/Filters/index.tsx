import React, { useMemo } from "react";

import AddIcon from "@mui/icons-material/Add";
import uniqid from "uniqid";

import { usePanel } from "src/store/panels";
import { useSessionUser } from "src/store/auth";

import useWindowSize from "src/hooks/useWindowSize";

import { Button, Typography } from "@mui/material";
import Filter from "./Filter";

import { filterContainerStyles } from "./styles";

type FiltersProps = {
  panelId: string;
};

const Filters = ({ panelId }: FiltersProps) => {
  const {
    filters = [],
    setPanelFilters,
    getPanelResults,
    updatePanel,
    panel,
  } = usePanel(panelId);

  const { width } = useWindowSize();
  const isTablet = width < 768;

  const sessionUser = useSessionUser();
  const sessionUserCanEdit = sessionUser?.id === panel?.userId;

  const filterElements = useMemo(() => {
    return (
      filters?.map((filter) => {
        return <Filter key={filter.id} panelId={panelId} filter={filter} />;
      }) || []
    );
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateResults = () => {
    if (sessionUserCanEdit) {
      getPanelResults();
      const activeFilters = filters.filter((f) => f.value !== "");

      const freshAnalyses = {};
      Object.keys(panel.analysis).map((key) => {
        freshAnalyses[key] = {
          ...panel.analysis[key],
          results: {},
        };
        return null;
      });

      updatePanel({
        filters: activeFilters,
        analysis: freshAnalyses,
      });
    }
  };

  return (
    <div className={`filter-container ${filterContainerStyles}`}>
      <div className="filters">
        <Button
          variant="contained"
          disabled={!sessionUserCanEdit}
          onClick={handleUpdateResults}
          style={{
            position: isTablet ? "relative" : "absolute",
            ...(isTablet ? {} : { right: "16px" }),
            ...(isTablet ? {} : { top: filters?.length > 0 ? "32px" : "24px" }),
          }}
        >
          Update Results
        </Button>
        {filterElements}
        <div className="d-inline-block">
          <Button
            variant="outlined"
            color="primary"
            disabled={!sessionUserCanEdit}
            onClick={() => {
              setPanelFilters([
                ...(filters || []),
                { id: uniqid(), value: "" },
              ]);
            }}
            sx={{
              border: "1px solid black",
              color: "black",
              marginRight: "12px",
              width: "36px",
              height: "36px",
              minWidth: 0,
            }}
          >
            <AddIcon fontSize="medium" />
          </Button>
          {filters?.length > 0 ? null : (
            <Typography
              sx={{
                fontWeight: "600",
                display: "inline",
                textTransform: "uppercase",
                fontSize: "14px",
              }}
            >
              Add a filter
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;
