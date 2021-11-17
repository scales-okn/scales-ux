import { FormControl, InputGroup } from "react-bootstrap";
import React, { FunctionComponent, ReactNode, useState } from "react";

import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";
import type { FilterInput } from "../NotebookContext";
import FilterTypeDropDown from "./FitlerTypeDropDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import { useNotebookContext } from "../NotebookContext";
import { AsyncTypeahead } from "react-bootstrap-typeahead";

type Props = {
  filterInput: FilterInput;
};

const Filter: FunctionComponent<Props> = (props) => {
  const { filterInput } = props;
  const { id, type, value } = filterInput;
  const {
    setFilterInputs,
    filterInputs,
    getFilterColumnByKey,
    getFilterOptionsByKey,
    setFilterInput,
  } = useNotebookContext();
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const filterColumn = getFilterColumnByKey(type);
  const filterOptions = getFilterOptionsByKey(type);
  const [dateValue, onChange] = useState([new Date(), new Date()]);

  const fetchAutocompleteSuggestions = async (type, query) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/autocomplete/?type=${type}&query=${query}`
      );
      const data = await response.json();

      setAutoCompleteSuggestions(data);
      setIsLoading(false);
    } catch (error) {
      // TODO: Implement Error handling
    }
  };

  const filterTypeRender = (filterType: string, value: string | number) => {
    switch (filterType) {
      case "date":
        return (
          <DateTimeRangePicker
            format="mm/dd/yyyy"
            onChange={onChange}
            value={dateValue}
          />
        );

      default:
        return (
          <>
            {filterOptions?.autocomplete ? (
              <AsyncTypeahead
                filterBy={() => true}
                isLoading={isLoading}
                labelKey={null}
                minLength={3}
                onSearch={(query) =>
                  fetchAutocompleteSuggestions(filterInput.type, query)
                }
                options={autoCompleteSuggestions}
                placeholder="Search..."
                renderMenuItemChildren={(option, props) => (
                  <span>{option}</span>
                )}
              />
            ) : (
              <FormControl
                className="border-end-0"
                size="sm"
                onChange={(event) =>
                  setFilterInput({ ...filterInput, value: event.target.value })
                }
                value={value}
              />
            )}
          </>
        );
    }
  };

  console.log(filterInput);

  return (
    <div
      className="d-inline-block me-3"
      style={{
        width: filterOptions?.type === "date" ? "auto" : filterColumn?.width,
        minWidth: "230px",
      }}
    >
      <InputGroup className="mb-3">
        <InputGroup.Text className="bg-white">
          <FilterTypeDropDown filterInput={filterInput} />
        </InputGroup.Text>
        {filterTypeRender(filterOptions?.type, value)}
        <InputGroup.Text
          className="cursor-pointer bg-transparent"
          onClick={() =>
            setFilterInputs(() => [
              ...filterInputs.filter(
                (filterInput: FilterInput) => filterInput.id !== id
              ),
            ])
          }
        >
          <FontAwesomeIcon icon={faTimesCircle} className="text-muted" />
        </InputGroup.Text>
      </InputGroup>
    </div>
  );
};

export default Filter;
