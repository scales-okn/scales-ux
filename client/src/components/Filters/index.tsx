import React, { useMemo } from "react";

import AddIcon from "@mui/icons-material/Add";
import uniqid from "uniqid";

import { usePanel } from "src/store/panels";

import Button from "@mui/material/Button";
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
  } = usePanel(panelId);

  const filterElements = useMemo(() => {
    return (
      filters?.map((filter) => {
        return <Filter key={filter.id} panelId={panelId} filter={filter} />;
      }) || []
    );
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateResults = () => {
    getPanelResults();
    updatePanel({ filters: [] }); // TODO: replace with real filter update instead of resetting
  };

  return (
    <div className={`filter-container ${filterContainerStyles}`}>
      <div className="filters">
        {filterElements}
        <div className="d-inline-block">
          <Button
            variant="outlined"
            color="success"
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
          {filters?.length ? (
            <Button
              variant="contained"
              onClick={handleUpdateResults}
              style={{ position: "absolute", right: "24px", top: "32px" }}
            >
              Update Results
            </Button>
          ) : (
            <>Add a filter</>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;
