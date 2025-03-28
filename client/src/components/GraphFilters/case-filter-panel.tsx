"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useLazyQuery } from "@apollo/client";
import { GET_AUTOCOMPLETE_DATA } from "../../graphql/queries";
import { debounce } from "lodash";

interface CaseFilterPanelProps {
  onApplyFilters: (filters: any) => void;
}

export function CaseFilterPanel({ onApplyFilters }: CaseFilterPanelProps) {
  const [filters, setFilters] = useState<{
    caseStatus: string | null;
    filingDateStart: Date | null;
    filingDateEnd: Date | null;
    natureSuit: string | null;
  }>({
    caseStatus: null,
    filingDateStart: null,
    filingDateEnd: null,
    natureSuit: null,
  });

  const [caseStatusOptions, setCaseStatusOptions] = useState<string[]>([]);
  const [natureSuitOptions, setNatureSuitOptions] = useState<string[]>([]);

  const [getAutocompleteData, { loading: autocompleteLoading }] = useLazyQuery(
    GET_AUTOCOMPLETE_DATA,
  );

  // Debounced function to fetch autocomplete data
  const fetchAutocompleteData = debounce(
    async (field: string, value: string) => {
      await getAutocompleteData({
        variables: { field, value },
        onCompleted: (data) => {
          if (field === "caseStatus") {
            setCaseStatusOptions(data.getAutoCompleteData);
          } else if (field === "natureSuit") {
            setNatureSuitOptions(data.getAutoCompleteData);
          }
        },
      });
    },
    300,
  );

  const handleCaseStatusChange = (
    _event: React.SyntheticEvent,
    value: string | null,
  ) => {
    setFilters({
      ...filters,
      caseStatus: value,
    });
  };

  const handleNatureSuitChange = (
    _event: React.SyntheticEvent,
    value: string | null,
  ) => {
    setFilters({
      ...filters,
      natureSuit: value,
    });
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setFilters({
      ...filters,
      [name]: date,
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      caseStatus: null,
      filingDateStart: null,
      filingDateEnd: null,
      natureSuit: null,
    });
  };

  // Load initial autocomplete options on mount
  useEffect(() => {
    async function fetchData() {
      await fetchAutocompleteData("caseStatus", "");
      await fetchAutocompleteData("natureSuit", "");
    }
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Court Cases Filters
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Case Information
      </Typography>

      <Autocomplete
        fullWidth
        options={caseStatusOptions}
        value={filters.caseStatus}
        onChange={handleCaseStatusChange}
        onInputChange={(_, newInputValue) => {
          fetchAutocompleteData("caseStatus", newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Case Status"
            margin="normal"
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {autocompleteLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Autocomplete
        fullWidth
        options={caseStatusOptions}
        value={filters.caseStatus}
        onChange={handleCaseStatusChange}
        onInputChange={(_, newInputValue) => {
          fetchAutocompleteData("ontologlyLabel", newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Ontologly Label"
            margin="normal"
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {autocompleteLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Autocomplete
        fullWidth
        options={natureSuitOptions}
        value={filters.natureSuit}
        onChange={handleNatureSuitChange}
        onInputChange={(_, newInputValue) => {
          fetchAutocompleteData("natureSuit", newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Nature of Suit"
            margin="normal"
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {autocompleteLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" gutterBottom>
        Filing Date Range
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Filed After"
          value={filters.filingDateStart}
          onChange={(date) => handleDateChange("filingDateStart", date)}
          slotProps={{
            textField: { size: "small", fullWidth: true, margin: "normal" },
          }}
        />
        <DatePicker
          label="Filed Before"
          value={filters.filingDateEnd}
          onChange={(date) => handleDateChange("filingDateEnd", date)}
          slotProps={{
            textField: { size: "small", fullWidth: true, margin: "normal" },
          }}
        />
      </LocalizationProvider>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={handleClearFilters}
        >
          Clear
        </Button>
      </Stack>
    </Box>
  );
}
