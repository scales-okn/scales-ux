import React, { FunctionComponent, ReactNode, useState } from "react";

import { Dropdown } from "react-bootstrap";
import { useEffect } from "react";
import { useNotebookContext } from "../NotebookContext";

type FilterColumn = {
  key: string;
  nicename: string;
};

type Props = {
  filterInput: string;
};

const FilterTypeDropDown: FunctionComponent<Props> = (props) => {
  const { id } = props;
  const [filter, setFilter] = useState<FilterColumn>();
  const {
    filterInputs,
    setFilterInputs,
    getFilterInputById,
    getFiltersNormalized,
  } = useNotebookContext();

  useEffect(() => {
    try {
      if (filter) {
        setFilterInputs((prev) => {
          return [
            ...prev.filter((filterInput) => filterInput.id !== id),
            { ...getFilterInputById(id), type: filter.key },
          ];
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, [filter]);

  const filtersToRender = getFiltersNormalized()?.map((filter) => {
    const { allowMultiple, key } = filter;
    if (
      allowMultiple === false &&
      filterInputs.some((filterInput) => filterInput.type === key)
    ) {
      return { ...filter, disabled: true };
    }

    return filter;
  });

  return (
    <Dropdown className="filter-type-dropdown">
      <Dropdown.Toggle
        size="sm"
        variant="link"
        className="shadow-none text-decoration-none small"
      >
        {filter?.nicename || ""}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.ItemText className="text-muted fs-6 ms-3">
          <small>Select a filter type...</small>
        </Dropdown.ItemText>
        {filtersToRender?.map(({ key, nicename, desc, disabled }) => (
          <React.Fragment key={key}>
            <Dropdown.Divider />
            <Dropdown.Item
              onClick={() => setFilter({ key, nicename })}
              disabled={disabled}
            >
              <Dropdown.ItemText className={disabled ? "text-muted" : ""}>
                {nicename}
              </Dropdown.ItemText>
              {desc && (
                <Dropdown.ItemText className="text-muted fs-6">
                  <small>{desc}</small>
                </Dropdown.ItemText>
              )}
            </Dropdown.Item>
          </React.Fragment>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default FilterTypeDropDown;
