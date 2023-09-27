/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { FunctionComponent } from "react";
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

type Props = {
  parameters: any[];
  fetchAutocompleteSuggestions: (
    value: string,
    query: string,
  ) => Promise<string[]>;
  autoCompleteSuggestions: string[];
  setSelectedParameter: (parameter: any) => void;
  selectedParameter: string;
  loadingAutosuggestions: boolean;
};

const Parameters: FunctionComponent<Props> = ({
  parameters,
  fetchAutocompleteSuggestions,
  autoCompleteSuggestions,
  setSelectedParameter,
  selectedParameter,
  loadingAutosuggestions,
}) => {
  return (
    <>
      {parameters?.map((parameter, index) => (
        <FormControl
          key={index}
          fullWidth
          margin="normal"
          sx={{ maxWidth: "655px" }}
        >
          {parameter.type === "string" && (
            <>
              <InputLabel>{parameter.prompt}</InputLabel>
              <Autocomplete
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
                value={selectedParameter || "year"}
                multiple={parameter.allowMultiple}
                onChange={(e) => setSelectedParameter(e.target.value)}
                MenuProps={{
                  disableScrollLock: true,
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
