import { FormControl, InputGroup } from "react-bootstrap";
import React, { FunctionComponent, ReactNode, useState } from "react";

import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";
import type FilterInput from "../NotebookContext";
import FilterTypeDropDown from "./FitlerTypeDropDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import { useNotebookContext } from "../NotebookContext";

type Props {
  filterInput: object
}

const Filter: FunctionComponent = (props) => {
  const { filterInput } = props;
  const { id, type, value } = filterInput;
  const {
    setFilterInputs,
    filterInputs,
    getFilterColumnByKey,
    getFilterOptionsByKey,
  } = useNotebookContext();
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState([]);

  const filterColumn = getFilterColumnByKey(type);
  const filterOptions = getFilterOptionsByKey(type);
  const [dateValue, onChange] = useState([new Date(), new Date()]);

  const fetchAutocompleteSuggestions = async (type, query) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/autocomplete/?type=${type}&query=${query}`
      );
      const data = await response.json();

      setAutoCompleteSuggestions(data);
    } catch (error) {
      // TODO: Impelment Error handling
    }
  };

  const filterTypeRender = (filterType) => {
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
          <FormControl
            className="border-end-0"
            size="sm"
            onChange={(event) =>
              filterOptions.autocomplete &&
              fetchAutocompleteSuggestions(type, event.target.value)
            }
          />
        );
    }
  };

  // const autoCompleteListRender = () => {
  //  return <ListGroup>
  //   <ListGroup.Item>Cras justo odio</ListGroup.Item>
  //   <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
  //   <ListGroup.Item>Morbi leo risus</ListGroup.Item>
  //   <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
  //   <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
  // </ListGroup>
  //  }

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
          <FilterTypeDropDown id={id} />
        </InputGroup.Text>
        {filterTypeRender(filterOptions?.type)}
        <InputGroup.Text
          className="cursor-pointer bg-transparent"
          onClick={() =>
            setFilterInputs(() => [
              ...filterInputs.filter((filterInput) => filterInput.id !== id),
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
