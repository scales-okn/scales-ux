import React from "react";
import { FormControl, InputAdornment, TextField } from "@mui/material";
import { Autocomplete } from "@mui/material";

const Statements = ({
  statements,
  setSelectedStatement,
  selectedStatement,
}) => {
  const onStatementChange = (event, selected) => {
    const selectedStatement = selected?.statement;
    if (!selectedStatement) return;
    setSelectedStatement(selected);
  };

  return (
    <FormControl
      fullWidth
      variant="outlined"
      margin="normal"
      sx={{ maxWidth: "655px" }}
    >
      <Autocomplete
        loading={!statements ? true : false}
        options={statements.filter(
          (stmt) => !stmt.statement.includes("filing year"),
        )}
        getOptionLabel={(option) => option.statement || ""}
        renderInput={(params) => (
          <TextField
            {...params}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            }}
            placeholder="Search or select a statement..."
          />
        )}
        onChange={onStatementChange}
        value={selectedStatement} // Use selectedStatement directly
        isOptionEqualToValue={(option, value) =>
          value === null || option.statement === value.statement
        }
      />
    </FormControl>
  );
};

export default Statements;
