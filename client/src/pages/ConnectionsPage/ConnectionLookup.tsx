import React, { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

const ConnectionLookup = ({ team, updateTeam, availableTeamMembers }) => {
  const [value, setValue] = useState(null);
  return (
    <>
      <Autocomplete
        options={
          availableTeamMembers.map((tm) => {
            return {
              label: `${tm.firstName} ${tm.lastName}`,
              value: tm.id,
            };
          }) || []
        }
        value={value}
        renderInput={(params) => {
          return <TextField {...params} label="Add Connection to Team" />;
        }}
        renderOption={(props, option) => {
          return (
            <li {...props} style={{ textTransform: "capitalize" }}>
              {option.label}
            </li>
          );
        }}
        disableClearable
        onChange={(_, fieldValue: { label: string; value: number }) => {
          if (fieldValue) {
            setValue(null);
            updateTeam(team.id, {
              userIdToAdd: fieldValue.value,
            });
          }
        }}
        sx={{
          minWidth: "250px",
          width: "100%",
          "*": {
            textTransform: "capitalize",
          },

          "& .MuiInputBase-root": {
            cursor: "pointer",
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
    </>
  );
};

export default ConnectionLookup;
