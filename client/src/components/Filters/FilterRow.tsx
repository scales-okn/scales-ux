import React, { useMemo } from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import uniqid from "uniqid";

import { usePanel } from "../../store/panels";
import Filter from "./Filter";
import * as S from "./styles";

type FilterRowProps = {
  panelId: string;
};

const FilterRow = ({ panelId }: FilterRowProps) => {
  const { filters = [], setPanelFilters, getPanelResults } = usePanel(panelId);

  const renderedFilters = useMemo(() => {
    const out = [];
    if (filters) {
      out.push(
        filters?.map((filter) => {
          return (
            <S.FilterContainer key={filter.id}>
              <Filter panelId={panelId} filter={filter} />
              {filter !== filters[filters.length - 1] && <S.OrText>OR</S.OrText>}
            </S.FilterContainer>
          );
        }),
      );
    }
    return out;
  }, [filters]); // eslint-disable-line

  return (
    <S.NotebookFilters>
      <S.RenderedFilters>{renderedFilters}</S.RenderedFilters>
      <div className="d-inline-block">
        <Button
          variant="outline-dark"
          className="mx-3"
          onClick={() => {
            setPanelFilters([...(filters || []), { id: uniqid(), value: "" }]);
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>
    </S.NotebookFilters>
  );
};

export default FilterRow;
