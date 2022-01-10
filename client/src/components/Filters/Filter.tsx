import React, { FunctionComponent, useState } from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";

import FilterTypeDropDown from "./FitlerTypeDropDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import uniqid from "uniqid";
import { infoSelector } from "../../store/info";
import { Form } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";

export type FilterInput = {
  id: string;
  value: string | number;
  type: string;
};

type Props = {
  filterInput: FilterInput;
  filterInputs: Array<FilterInput>;
  selectedRing: any;
  setFilterInputs: any;
  fetchResults: any;
};

const Filter: FunctionComponent<Props> = (props) => {
  const { filterInput, filterInputs, selectedRing, setFilterInputs, fetchResults } = props;
  const { id, type, value } = filterInput;
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [dateValue, setDateValue] = useState([new Date(), new Date()]);
  const { info, hasErrors, loadingInfo } = useSelector(infoSelector);
  const { filters = [], columns = [], defaultEntity } = info;

  const setFilterInput = (filterInput: FilterInput) => {
    try {
      setFilterInputs((prevFilterInputs: Array<FilterInput>) => {
        return [
          ...prevFilterInputs.filter(
            (prevFilterInput: FilterInput) =>
              prevFilterInput.id !== filterInput.id
          ),
          { ...filterInput },
        ];
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getFilterInputById = (id: string) => {
    try {
      return filterInputs?.find(
        (filterInput: FilterInput) => filterInput.id === id
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getFilterColumnByKey = (key: string) => {
    try {
      return columns.find((column) => column.key == key);
    } catch (error) {
      console.log(error);
    }
  };

  const getFilterOptionsByKey = (key) => {
    try {
      return filters.find((filter) => filter.includes(key))[1];
    } catch (error) {
      console.log(error);
    }
  };

  const getFiltersNormalized = () => {
    try {
      return filters
        .map((filter) => ({ key: filter[0], ...filter[1] }))
        .sort((a, b) => a.key.localeCompare(b.key));
    } catch (error) {
      console.log(error);
    }
  };


  const filterColumn = getFilterColumnByKey(type);
  const filterOptions = getFilterOptionsByKey(type);

  const fetchAutocompleteSuggestions = async (type, query) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/autocomplete/${selectedRing.rid}/1/${defaultEntity}/${type}?query=${query}`
      );
      const data = await response.json();

      console.log(data);

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
                options={autoCompleteSuggestions.map(String)}
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

          <FilterTypeDropDown
            filterInput={filterInput}
            getFilterOptionsByKey={getFilterOptionsByKey}
            filterInputs={filterInputs}
            setFilterInputs={setFilterInputs}
            getFiltersNormalized={getFiltersNormalized}
            setFilterInput={setFilterInput} />
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

            fetchResults(selectedRing, newFilterInputs);
          }}
        >
          <FontAwesomeIcon icon={faTimesCircle} className="text-muted" />
        </InputGroup.Text>
      </InputGroup>
    </div>
  );
};

export default Filter;
