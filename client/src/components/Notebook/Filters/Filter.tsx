import React, { FunctionComponent, useState } from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";
import type { FilterInput } from "../NotebookContext";
import FilterTypeDropDown from "./FitlerTypeDropDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import { useNotebookContext } from "../NotebookContext";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import uniqid from "uniqid";

import { Form } from "react-bootstrap";

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
    fetchResults,
    ring,
  } = useNotebookContext();
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const filterColumn = getFilterColumnByKey(type);
  const filterOptions = getFilterOptionsByKey(type);
  const [dateValue, setDateValue] = useState([new Date(), new Date()]);

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

  const filterTypeRange = (
    <>
      <FormControl
        placeholder="min"
        min="0"
        type="number"
        className="filter-range-input"
      />
      <InputGroup.Text>-</InputGroup.Text>
      <FormControl
        placeholder="max"
        type="number"
        max="99999"
        className="filter-range-input"
      />
    </>
  );

  const filterTypeRender = (filterType: string, value: string | number) => {
    switch (filterType) {
      case "range":
        return filterTypeRange;

      case "date":
        return (
          <DateTimeRangePicker
            format="MM/dd/yyyy"
            onChange={(value) => {
              console.log(value);
              setDateValue(value);
              setFilterInput({ ...filterInput, value: value });
            }}
            value={dateValue}
          />
        );

      default:
        return (
          <>
            {filterOptions?.autocomplete ? (
              <AsyncTypeahead
                id={uniqid()}
                filterBy={() => true}
                isLoading={isLoading}
                labelKey={null}
                minLength={3}
                onSearch={(query) =>
                  fetchAutocompleteSuggestions(filterInput.type, query)
                }
                options={autoCompleteSuggestions}
                placeholder="Search..."
                defaultInputValue={value}
                onBlur={(event) =>
                  setFilterInput({ ...filterInput, value: event.target.value })
                }
              />
            ) : filterInput.type === "causeOfAction" ? (
              filterTypeRange
            ) : (
              <FormControl
                className="border-end-0"
                size="sm"
                onChange={(event) => {
                  if (!filterInput) {
                    return false;
                  }
                  setFilterInput({ ...filterInput, value: event.target.value });
                }}
                value={value}
              />
            )}
          </>
        );
    }
  };

  return (
    <div className="d-inline-block me-3">
      <InputGroup className="mb-3">
        <InputGroup.Text className="bg-white">
          <FilterTypeDropDown filterInput={filterInput} />
        </InputGroup.Text>
        {filterTypeRender(filterOptions?.type, value)}
        <InputGroup.Text
          className="cursor-pointer bg-transparent"
          onClick={async () => {
            const newFilterInputs = [
              ...filterInputs.filter(
                (filterInput: FilterInput) => filterInput.id !== id
              ),
            ];
            await setFilterInputs(newFilterInputs);

            fetchResults(ring, newFilterInputs);
          }}
        >
          <FontAwesomeIcon icon={faTimesCircle} className="text-muted" />
        </InputGroup.Text>
      </InputGroup>
    </div>
  );
};

export default Filter;
