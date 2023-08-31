import React, { useMemo } from "react";

import AddIcon from "@mui/icons-material/Add";
import uniqid from "uniqid";

import { usePanel } from "store/panels";

import StandardButton from "components/Buttons/StandardButton";
import Filter from "./Filter";

import { styles } from "./styles";

type FiltersProps = {
  panelId: string;
};

const Filters = ({ panelId }: FiltersProps) => {
  const { filters = [], setPanelFilters, getPanelResults } = usePanel(panelId);

  const filterElements = useMemo(() => {
    const out = [];
    if (filters) {
      out.push(
        filters?.map((filter) => {
          return <Filter key={filter.id} panelId={panelId} filter={filter} />;
        }),
      );
    }
    return out;
  }, [filters]); // eslint-disable-line

  return (
    <div className={`filter-container ${styles}`}>
      <div className="filters">
        {filterElements}
        <div className="d-inline-block">
          <StandardButton
            variant="outline-dark"
            className="me-2"
            onClick={() => {
              setPanelFilters([
                ...(filters || []),
                { id: uniqid(), value: "" },
              ]);
            }}
          >
            <AddIcon fontSize="medium" />
          </StandardButton>
          {!filters?.length && <>Add a filter</>}
          <StandardButton
            variant="primary"
            className="text-white"
            onClick={() => getPanelResults(filters)}
            style={{ position: "absolute", right: "24px", top: "24px" }}
          >
            Update Results
          </StandardButton>
        </div>
      </div>
    </div>
  );
};

export default Filters;
