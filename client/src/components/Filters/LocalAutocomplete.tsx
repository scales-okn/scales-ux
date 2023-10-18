import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { usStates, caseStatuses, caseTypes } from "./autocompleteOptions";

// TODO: fix
// type StateAutocompleteT = {
//   setFilter: (arg: Record<string, unknown>) => void;
//   filter: Record<string, unknown>;
//   autocompleteValues: any[];
//   disabled?: boolean;
// };

const StateAutocomplete = ({
  setFilter,
  filter,
  autocompleteValues,
  disabled,
  type,
}) => {
  const [inputValue, setInputValue] = useState("");
  const options = {
    case_status: {
      placeholderText: "Case Status",
      items: caseStatuses,
    },
    case_type: {
      placeholderText: "Case Type",
      items: caseTypes,
    },
    state_abbrev: {
      placeholderText: "US State",
      items: usStates,
    },
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  const filterOptions = (options, { inputValue }) => {
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        option.value.toLowerCase().includes(inputValue.toLowerCase()),
    );
  };

  return (
    <Autocomplete
      multiple
      disabled={disabled}
      disableClearable
      filterOptions={filterOptions}
      onChange={(_, fieldValue) => {
        if (!filter) {
          return false;
        }
        setFilter({
          ...filter,
          value: fieldValue.map((x) => x.value).join("|"),
        });
      }}
      options={options[type]?.items || []}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      value={autocompleteValues}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label={options[type]?.placeholderText}
          variant="outlined"
        />
      )}
      sx={{
        minWidth: "250px",

        "& .MuiInputBase-root": {
          borderRadius: "0 4px 4px 0",
        },
        "& .MuiAutocomplete-endAdornment": {
          display: "none",
          top: "unset",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          height: "calc(100% + 5px)",
        },
        "& .MuiChip-root": {
          background: "rgba(0, 0, 0, 0.1)",
          borderRadius: "25px",
          textTransform: "capitalize",
        },
      }}
    />
  );
};

export default StateAutocomplete;
