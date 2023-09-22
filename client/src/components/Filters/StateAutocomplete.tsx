import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { usStates } from "./usStates";

const StateAutocomplete = ({ setFilter, filter }) => {
  const [inputValue, setInputValue] = useState("");

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
      options={usStates}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      renderInput={(params) => (
        <TextField {...params} label="Select a U.S. State" variant="outlined" />
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
