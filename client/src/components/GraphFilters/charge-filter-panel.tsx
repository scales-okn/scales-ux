import React, { useState, useEffect } from "react"
import { Box, Typography, TextField, Autocomplete, Button, Stack, Divider, CircularProgress } from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { useLazyQuery } from "@apollo/client"
import { GET_AUTOCOMPLETE_DATA } from "../../graphql/queries"
import { debounce } from "lodash"

interface AutoCompleteData {
  getAutoCompleteData: string[]
}

interface AutoCompleteVariables {
  field: string
  value: string
}

interface ChargeFilterPanelProps {
  onApplyFilters: (filters: any) => void
}

type FilterField = "chargeDescription" | "chargeType" | "chargeStatus" | "disposition"

export function ChargeFilterPanel({ onApplyFilters }: ChargeFilterPanelProps): React.ReactElement {
  const [filters, setFilters] = useState<{
    chargeDescription: string | null
    chargeType: string | null
    chargeStatus: string | null
    filingDateStart: Date | null
    filingDateEnd: Date | null
    disposition: string | null
  }>({
    chargeDescription: null,
    chargeType: null,
    chargeStatus: null,
    filingDateStart: null,
    filingDateEnd: null,
    disposition: null,
  })

  const [options, setOptions] = useState<{
    chargeDescription: string[]
    chargeType: string[]
    chargeStatus: string[]
    disposition: string[]
  }>({
    chargeDescription: [],
    chargeType: [],
    chargeStatus: [],
    disposition: [],
  })

  const [loadingField, setLoadingField] = useState<FilterField | null>(null)

  const [getAutocompleteData] = useLazyQuery<AutoCompleteData, AutoCompleteVariables>(
    GET_AUTOCOMPLETE_DATA
  )

  // Single debounced function for all fields
  const fetchAutocompleteData = React.useCallback(
    debounce(async (field: FilterField, value: string) => {
      setLoadingField(field)
      try {
        const result = await getAutocompleteData({
          variables: { field, value },
        })
        if (result.data) {
          setOptions(prev => ({
            ...prev,
            [field]: result.data?.getAutoCompleteData || [],
          }))
        }
      } catch (error) {
        console.error(`Error fetching ${field} data:`, error)
      } finally {
        setLoadingField(null)
      }
    }, 300),
    [getAutocompleteData]
  )

  const handleAutocompleteChange = (field: FilterField, value: string | null) => {
    setFilters({
      ...filters,
      [field]: value,
    })
  }

  const handleDateChange = (name: string, date: Date | null) => {
    setFilters({
      ...filters,
      [name]: date,
    })
  }

  const handleApplyFilters = (): void => {
    onApplyFilters(filters)
  }

  const handleClearFilters = () => {
    setFilters({
      chargeDescription: null,
      chargeType: null,
      chargeStatus: null,
      filingDateStart: null,
      filingDateEnd: null,
      disposition: null,
    })
  }

  useEffect(() => {
    // Load initial data for all fields with a single call
    const fields: FilterField[] = [
      "chargeDescription",
      "chargeType",
      "chargeStatus",
      "disposition",
    ]

    // Use Promise.all to load all data in parallel
    Promise.all(
      fields.map(field =>
        getAutocompleteData({
          variables: { field, value: "" },
        })
      )
    )
      .then(results => {
        const newOptions = { ...options }

        results.forEach((result, index) => {
          if (result.data) {
            const field = fields[index]
            newOptions[field] = result.data.getAutoCompleteData
          }
        })

        setOptions(newOptions)
      })
      .catch(error => {
        console.error("Error fetching initial data:", error)
      })
  }, []) // Empty dependency array ensures this runs only once on mount

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
        options={options.chargeDescription}
        value={filters.chargeDescription}
        onChange={(_, value) => handleAutocompleteChange("chargeDescription", value)}
        onInputChange={(_, newInputValue) => {
          fetchAutocompleteData("chargeDescription", newInputValue)
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
                  {loadingField === "chargeDescription" ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Autocomplete
        fullWidth
        options={options.chargeType}
        value={filters.chargeType}
        onChange={(_, value) => handleAutocompleteChange("chargeType", value)}
        onInputChange={(_, newInputValue) => {
          fetchAutocompleteData("chargeType", newInputValue)
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
                  {loadingField === "chargeType" ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Autocomplete
        fullWidth
        options={options.chargeStatus}
        value={filters.chargeStatus}
        onChange={(_, value) => handleAutocompleteChange("chargeStatus", value)}
        onInputChange={(_, newInputValue) => {
          fetchAutocompleteData("chargeStatus", newInputValue)
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
                  {loadingField === "chargeStatus" ? <CircularProgress color="inherit" size={20} /> : null}
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
          slotProps={{ textField: { size: "small", fullWidth: true, margin: "normal" } }}
        />
        <DatePicker
          label="Filed Before"
          value={filters.filingDateEnd}
          onChange={(date) => handleDateChange("filingDateEnd", date)}
          slotProps={{ textField: { size: "small", fullWidth: true, margin: "normal" } }}
        />
      </LocalizationProvider>

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" gutterBottom>
        Disposition
      </Typography>

      <Autocomplete
        fullWidth
        options={options.disposition}
        value={filters.disposition}
        onChange={(_, value) => handleAutocompleteChange("disposition", value)}
        onInputChange={(_, newInputValue) => {
          fetchAutocompleteData("disposition", newInputValue)
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Disposition"
            margin="normal"
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingField === "disposition" ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button variant="contained" color="primary" fullWidth onClick={handleApplyFilters}>
          Apply Filters
        </Button>
        <Button variant="outlined" color="secondary" fullWidth onClick={handleClearFilters}>
          Clear
        </Button>
      </Stack>
    </Box>
  )
}