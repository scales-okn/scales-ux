import type React from "react"
import { useState, useEffect } from "react"
import { useQuery, useLazyQuery } from "@apollo/client"
import { gql } from "@apollo/client"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Chip,
  Box,
  Paper,
  Button,
  Stack,
  Autocomplete,
  CircularProgress,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import CloseIcon from "@mui/icons-material/Close"
import SearchIcon from "@mui/icons-material/Search"
import ClearIcon from "@mui/icons-material/Clear"
import { debounce } from "lodash"

const GET_FILTERS = gql`
  query GetFilters($entity: String!) {
    getFiltersForEntity(entity: $entity) {
      label
      type
      field
      value
      subFilters {
        label
        type
        field
        value
      }
      autoComplete {
        label
        value
      }
    }
  }
`

const GET_AUTOCOMPLETE = gql`
  query GetAutoComplete($field: String!, $value: String!) {
    getAutoCompleteData(field: $field, value: $value)
  }
`

type AutoComplete = {
  label: string
  value: string
}

type Filter = {
  label: string
  type: string
  field: string
  value: string
  autoComplete?: AutoComplete[]
  subFilters?: Filter[]
}

export const DynamicFilterPanel: React.FC<{ baseEntity: string; onApplyFilters: (filters: Filter[]) => void }> = ({ baseEntity, onApplyFilters }) => {
  const [filters, setFilters] = useState<Filter[]>([])
  const [activeFilters, setActiveFilters] = useState<Filter[]>([])
  const [expandedFilters, setExpandedFilters] = useState<string[]>([])
  const [pendingFilters, setPendingFilters] = useState<Filter[]>([])
  const [autocompleteOptions, setAutocompleteOptions] = useState<Record<string, string[]>>({})
  const [autocompleteLoading, setAutocompleteLoading] = useState<Record<string, boolean>>({})

  const { data, loading, error, refetch } = useQuery(GET_FILTERS, {
    variables: { entity: baseEntity },
  })

  const [getAutocompleteData] = useLazyQuery(GET_AUTOCOMPLETE)

  // Create debounced fetch function for autocomplete
  const fetchAutocompleteData = debounce(async (field: string, value: string) => {
    setAutocompleteLoading(prev => ({ ...prev, [field]: true }))
    try {
      const { data } = await getAutocompleteData({
        variables: { field, value },
      })
      setAutocompleteOptions(prev => ({ ...prev, [field]: data.getAutoCompleteData }))
    } finally {
      setAutocompleteLoading(prev => ({ ...prev, [field]: false }))
    }
  }, 300)

  useEffect(() => {
    if (data) {

      setFilters(data.getFiltersForEntity)
      // Initialize autocomplete options for string fields
      data.getFiltersForEntity.forEach(filter => {
        console.log(filter)
        // fetchAutocompleteData(filter.field, '')
      })
    }
  }, [data])

  const handleFilterChange = async (filter: Filter) => {
    if (filter.type === 'type') {
      const value = filter.value
      refetch({ entity: value })
      // const entityTypeIndex = filters.findIndex((f) => f.type === 'type')
      // const entityTypeFilter = filters[entityTypeIndex]
      // const newFilters = [entityTypeFilter, ...data.getFiltersForEntity]
      // console.log("entityTypeFilter", newFilters)
      // setFilters(newFilters)
    } else {
      setPendingFilters((prev) => {
        const existingIndex = prev.findIndex((f) => f.field === filter.field)
        if (existingIndex > -1) {
          const newFilters = [...prev]
          newFilters[existingIndex] = { label: filter.label, field: filter.field, value: filter.value ?? '', type: filter.type }
          return newFilters
        }
        return [...prev, { label: filter.label, field: filter.field, value: filter.value ?? '', type: filter.type }]
      })
    }
  }

  const handleApply = () => {
    setActiveFilters(pendingFilters)
    onApplyFilters(pendingFilters)
  }

  const handleClear = () => {
    setPendingFilters([])
    setActiveFilters([])
    onApplyFilters([])
  }

  const removeFilter = (field: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.field !== field))
    setFilters((prev) => prev.filter((f) => f.field !== field))
  }

  const toggleExpanded = (field: string) => {
    setExpandedFilters((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]))
  }

  const renderFilter = (filter: Filter) => {
    switch (filter.type) {
      case "string":
        return (
          <Autocomplete
            fullWidth
            options={autocompleteOptions[filter.field] || []}
            value={filter.value || null}
            onChange={(_, newValue) => handleFilterChange({ ...filter, value: newValue as string })}
            onInputChange={(_, newInputValue) => {
              fetchAutocompleteData(filter.field, newInputValue)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={filter.label}
                margin="normal"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {autocompleteLoading[filter.field] ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        )
      case "date":
        return (
          <TextField
            fullWidth
            label={filter.label}
            type="date"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            onChange={(e) => handleFilterChange({ ...filter, value: e.target.value as string })}
            margin="normal"
          />
        )
      case "enum":
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel id={`${filter.field}-label`}>{filter.label}</InputLabel>
            <Select
              labelId={`${filter.field}-label`}
              label={filter.label}
              onChange={(e) => handleFilterChange({ ...filter, value: e.target.value as string })}
            >
              {filter.autoComplete?.map(({ label, value }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      default:
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel id={`${filter.field}-label`}>{filter.label}</InputLabel>
            <Select
              labelId={`${filter.field}-label`}
              label={filter.label}
              onChange={(e) => handleFilterChange({ ...filter, value: e.target.value as string })}
            >
              {filter.autoComplete?.map(({ label, value }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
    }
  }

  const renderSubFilters = (subFilters: Filter[]) => {
    return (
      <Box>
        {subFilters.map((subFilter) => (
          <Accordion
            key={subFilter.field}
            expanded={expandedFilters.includes(subFilter.field)}
            onChange={() => toggleExpanded(subFilter.field)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{subFilter.label}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {expandedFilters.includes(subFilter.field) && (
                <DynamicFilterPanel
                  baseEntity={subFilter.field}
                  onApplyFilters={onApplyFilters}
                />
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    )
  }

  if (loading) return <Typography>Loading filters...</Typography>
  if (error) return <Typography color="error">Error loading filters: {error.message}</Typography>

  return (
    <Paper elevation={3} sx={{ width: 300, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      {filters.map((filter) => (
        <Box key={filter.field} mb={2}>
          {renderFilter(filter)}
          {filter.subFilters && renderSubFilters(filter.subFilters)}
        </Box>
      ))}
      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>
          Active Filters
        </Typography>
        {activeFilters.map(({ label, field, value }) => (
          <Chip
            key={field}
            label={`${label}: ${Array.isArray(value) ? value.join(", ") : value}`}
            onDelete={() => removeFilter(field)}
            deleteIcon={<CloseIcon />}
            sx={{ mr: 1, mb: 1 }}
          />
        ))}
      </Box>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleApply}
          disabled={pendingFilters.length === 0}
          fullWidth
        >
          Apply
        </Button>
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClear}
          disabled={activeFilters.length === 0}
          fullWidth
        >
          Clear
        </Button>
      </Stack>
    </Paper>
  )
}