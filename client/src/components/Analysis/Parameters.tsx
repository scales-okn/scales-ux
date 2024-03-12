/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import {
  Autocomplete,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  TextField,
} from "@mui/material";

type ParametersT = {
  parameters: any[];
  fetchAutocompleteSuggestions: (
    value: string,
    query: string,
  ) => Promise<string[]>;
  autoCompleteSuggestions: string[];
  setPanelStatement: (parameter: any) => void;
  selectedParameter: string;
  loadingAutosuggestions: boolean;
  disabled?: boolean;
};

const Parameters = ({
  parameters,
  fetchAutocompleteSuggestions,
  autoCompleteSuggestions,
  setPanelStatement,
  selectedParameter,
  loadingAutosuggestions,
  disabled = false,
}: ParametersT) => {
  return (
    <>
      {parameters?.map((parameter, index) => (
        <FormControl key={index} fullWidth margin="normal">
          {parameter.type === "string" && (
            <>
              <InputLabel>{parameter.prompt}</InputLabel>
              <Autocomplete
                disabled={disabled}
                loading={loadingAutosuggestions}
                options={autoCompleteSuggestions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="" />}
                onInputChange={(event, newValue) => {
                  fetchAutocompleteSuggestions(
                    parameter.options.attribute,
                    newValue,
                  );
                }}
                sx={{ minWidth: "300px" }}
              />
            </>
          )}
          {parameter.type === "boolean" && (
            <FormGroup>
              <FormControlLabel
                control={<Switch name={parameter.options.attribute} />}
                label={parameter.prompt}
              />
            </FormGroup>
          )}
          {parameter.type === "enum" && (
            <FormGroup>
              <Select
                disabled={disabled}
                value={selectedParameter || "year"}
                multiple={parameter.allowMultiple}
                onChange={(e) => setPanelStatement(e.target.value)}
                MenuProps={{
                  disableScrollLock: true,
                }}
                sx={{
                  "& .MuiSelect-select": {
                    paddingLeft: "24px",
                  },
                }}
              >
                {(parameter.options.length === 6
                  ? parameter.options
                      .slice(1, 3)
                      .concat(parameter.options.slice(3))
                  : parameter.options
                ).map((param, index) => (
                  <MenuItem
                    key={index}
                    value={param.value ? param.value : param}
                  >
                    {param.label ? param.label : param}
                  </MenuItem>
                ))}
              </Select>
            </FormGroup>
          )}
        </FormControl>
      ))}
    </>
  );
};

export default Parameters;
