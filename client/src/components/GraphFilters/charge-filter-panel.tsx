import React from "react";
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

interface ChargeFilterPanelProps {
  onApplyFilters: (filters: any) => void;
}

export function ChargeFilterPanel({ onApplyFilters }: ChargeFilterPanelProps) {
  const [filters, setFilters] = useState<{
    chargeDescription: string | null;
    chargeSeverity: string | null;
    chargeStatus: string | null;
    filingDateStart: Date | null;
    filingDateEnd: Date | null;
    disposition: string | null;
    chargeType: string | null;
  }>({
    chargeDescription: null,
    chargeSeverity: null,
    chargeStatus: null,
    filingDateStart: null,
    filingDateEnd: null,
    disposition: null,
    chargeType: null,
  });

  const [chargeDescriptionOptions, setChargeDescriptionOptions] = useState<
    string[]
  >([]);
  const [chargeSeverityOptions, setChargeSeverityOptions] = useState<string[]>(
    [],
  );
  const [chargeStatusOptions, setChargeStatusOptions] = useState<string[]>([]);
  const [dispositionOptions, setDispositionOptions] = useState<string[]>([]);
  const [chargeTypeOptions, setChargeTypeOptions] = useState<string[]>([]);

  const [getAutocompleteData, { loading: autocompleteLoading }] = useLazyQuery(
    GET_AUTOCOMPLETE_DATA,
  );

  // Debounced function to fetch autocomplete data
  const fetchAutocompleteData = debounce((field: string, value: string) => {
    getAutocompleteData({
      variables: { field, value },
      onCompleted: (data) => {
        switch (field) {
          case "chargeDescription":
            setChargeDescriptionOptions(data.getAutoCompleteData);
            break;
          case "chargeSeverity":
            setChargeSeverityOptions(data.getAutoCompleteData);
            break;
          case "chargeStatus":
            setChargeStatusOptions(data.getAutoCompleteData);
            break;
          case "disposition":
            setDispositionOptions(data.getAutoCompleteData);
            break;
        }
      },
    });
  }, 300);

  const handleAutocompleteChange = (field: string, value: string | null) => {
    setFilters({
      ...filters,
      [field]: value,
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
      chargeDescription: null,
      chargeSeverity: null,
      chargeStatus: null,
      filingDateStart: null,
      filingDateEnd: null,
      disposition: null,
      chargeType: null,
    });
  };

  // Load initial autocomplete options on mount
  useEffect(() => {
    fetchAutocompleteData("chargeDescription", "");
    fetchAutocompleteData("chargeSeverity", "");
    fetchAutocompleteData("chargeStatus", "");
    fetchAutocompleteData("disposition", "");
    fetchAutocompleteData("chargeType", "");
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Charges Filters
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Charge Information
      </Typography>

      <Autocomplete
        fullWidth
        options={chargeDescriptionOptions}
        value={filters.chargeDescription}
        onChange={(_, value) =>
          handleAutocompleteChange("chargeDescription", value)
        }
        onInputChange={(_, newInputValue) => {
          fetchAutocompleteData("chargeDescription", newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Charge Description"
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
        options={chargeSeverityOptions}
        value={filters.chargeSeverity}
        onChange={(_, value) =>
          handleAutocompleteChange("chargeSeverity", value)
        }
        onInputChange={(_, newInputValue) => {
          fetchAutocompleteData("chargeSeverity", newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Severity"
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
        options={chargeStatusOptions}
        value={filters.chargeStatus}
        onChange={(_, value) => handleAutocompleteChange("chargeStatus", value)}
        onInputChange={(_, newInputValue) => {
          fetchAutocompleteData("chargeStatus", newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Status"
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
        Date Range
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

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" gutterBottom>
        Disposition
      </Typography>

      <Autocomplete
        fullWidth
        options={chargeTypeOptions}
        value={filters.chargeType}
        onChange={(_, value) => handleAutocompleteChange("chargeType", value)}
        onInputChange={(_, newInputValue) => {
          fetchAutocompleteData("chargeType", newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Charge Type"
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
