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
  const { filters = [], setPanelFilters, getPanelResults } = usePanel(panelId);

  const filterElements = useMemo(() => {
    return (
      filters?.map((filter) => {
        return <Filter key={filter.id} panelId={panelId} filter={filter} />;
      }) || []
    );
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

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
              marginRight: "18px",
            }}
          >
            <AddIcon fontSize="medium" />
          </Button>
          {!filters?.length && <>Add a filter</>}
          <Button
            variant="contained"
            color="info"
            onClick={() => getPanelResults(filters)}
            style={{ position: "absolute", right: "24px", top: "24px" }}
          >
            Update Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
