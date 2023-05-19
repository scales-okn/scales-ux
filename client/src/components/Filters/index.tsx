import React from "react";
import { Button } from "react-bootstrap";

import FilterRow from "./FilterRow";
import { usePanel } from "../../store/panels";
import * as S from "./styles";

type FiltersProps = {
  panelId: string;
};

const Filters = ({ panelId }: FiltersProps) => {
  const { filters = [], setPanelFilters, getPanelResults } = usePanel(panelId);

  const rowMock = [0, 1, 2];

  return (
    <S.Section>
      <S.UpdateButtonContainer>
        {filters?.length > 0 && (
          <Button variant="primary" className="text-white" onClick={() => getPanelResults(filters)}>
            Update Results
          </Button>
        )}
      </S.UpdateButtonContainer>
      {rowMock.map((row) => {
        return (
          <div key={row}>
            <FilterRow panelId={panelId} />
            {row !== rowMock[rowMock.length - 1] ? (
              <S.AndLineContainer>
                <S.AndLine />
                <span>AND</span>
                <S.AndLine />
              </S.AndLineContainer>
            ) : (
              <S.AndLineContainer>
                <Button variant="outline-dark" onClick={() => null}>
                  Add Row
                </Button>
              </S.AndLineContainer>
            )}
          </div>
        );
      })}
    </S.Section>
  );
};

export default Filters;
