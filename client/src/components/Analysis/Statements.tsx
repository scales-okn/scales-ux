import React from "react";
import { Box, InputAdornment, TextField } from "@mui/material";
import { Autocomplete } from "@mui/material";

const Statements = ({ statements, setPanelStatement, selectedStatement }) => {
  const onStatementChange = (event, selected) => {
    if (selected) {
      setPanelStatement(selected);
    }
  };

  return (
    <Box sx={{ marginTop: "12px" }}>
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
        value={selectedStatement || null}
        isOptionEqualToValue={(option, value) => {
          return value === null || option.statement === value.statement;
        }}
        sx={{ minWidth: "300px" }}
      />
    </Box>
  );
};

export default Statements;
