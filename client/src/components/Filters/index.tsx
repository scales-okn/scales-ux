import React, { useMemo } from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Filter from "./Filter";
import uniqid from "uniqid";
import { usePanel } from "../../store/panels";
import * as S from "./styles";

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
    <S.FilterContainer>
      <S.Filters>
        {filterElements}
        <div className="d-inline-block">
          <Button
            variant="outline-dark"
            className="me-2"
            onClick={() => {
              setPanelFilters([...(filters || []), { id: uniqid(), value: "" }]);
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
          {!filters?.length && <>Add a filter</>}
          <Button variant="primary" className="text-white" onClick={() => getPanelResults(filters)} style={{ position: "absolute", right: "24px", top: "24px" }}>
            Update Results
          </Button>
        </div>
      </S.Filters>
    </S.FilterContainer>
  );
};

export default Filters;
