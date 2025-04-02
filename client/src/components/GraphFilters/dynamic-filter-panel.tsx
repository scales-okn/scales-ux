import { gql, useLazyQuery, useQuery } from "@apollo/client"
import ClearIcon from "@mui/icons-material/Clear"
import CloseIcon from "@mui/icons-material/Close"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import SearchIcon from "@mui/icons-material/Search"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { debounce } from "lodash"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../store"
import {
  setFiltersForEntity,
  clearFiltersForEntity,
  setAutocompleteOptions,
  setLoadingState,
  AutoComplete,
  Filter
} from "../../store/filters"

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
        autoComplete {
          label
          value
        }
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

export const DynamicFilterPanel: React.FC<{
  baseEntity: string;
  onApplyFilters: (filters: Filter[], isSubFilter: boolean) => void,
  isSubFilter: boolean
}> = ({ baseEntity, onApplyFilters, isSubFilter }) => {
  const dispatch = useAppDispatch()
  const storedFilters = useAppSelector(state => state.filters.activeFilters[baseEntity] || [])
  const storedAutocompleteOptions = useAppSelector(state =>
    state.filters.autocompleteOptions[baseEntity] || {}
  )
  const storedLoadingStates = useAppSelector(state =>
    state.filters.loadingStates[baseEntity] || {}
  )

  const [filters, setFilters] = useState<Filter[]>([])
  const [expandedFilters, setExpandedFilters] = useState<string[]>([])
  const [pendingFilters, setPendingFilters] = useState<Filter[]>(storedFilters)

  const { data, loading, error, refetch } = useQuery(GET_FILTERS, {
    variables: { entity: baseEntity },
  })

  const [getAutocompleteData] = useLazyQuery(GET_AUTOCOMPLETE)

  // Create debounced fetch function for autocomplete
  const fetchAutocompleteData = useCallback(debounce(async (field: string, value: string) => {
    dispatch(setLoadingState({ entity: baseEntity, field, isLoading: true }))
    try {
      const { data } = await getAutocompleteData({
        variables: { field, value },
      })

      // Transform the data to match AutoComplete format
      let options: AutoComplete[] = [];

      if (Array.isArray(data.getAutoCompleteData)) {
        options = data.getAutoCompleteData.map((item: any) => {
          // If the item already has the right structure
          if (item && typeof item === 'object' && 'label' in item && 'value' in item) {
            return item as AutoComplete;
          }
          // If it's a string or anything else, create a proper AutoComplete object
          const stringValue = String(item);
          return { label: stringValue, value: stringValue };
        });
      }

      dispatch(setAutocompleteOptions({
        entity: baseEntity,
        field,
        options
      }))
    } finally {
      dispatch(setLoadingState({ entity: baseEntity, field, isLoading: false }))
    }
  }, 300), [dispatch, baseEntity, getAutocompleteData])

  // Load autocomplete data for all string filters on initialization
  const loadInitialAutocompleteData = useCallback(async (filtersToLoad: Filter[]) => {
    const stringFilters = filtersToLoad.filter(filter => filter.type === "string")
    for (const filter of stringFilters) {
      // Only load if we don't already have data for this field
      if (!storedAutocompleteOptions[filter.field] ||
        storedAutocompleteOptions[filter.field].length === 0) {
        fetchAutocompleteData(filter.field, '')
      }
    }
  }, [fetchAutocompleteData, storedAutocompleteOptions])

  useEffect(() => {
    if (data) {
      const newFilters = data.getFiltersForEntity
      setFilters(newFilters)

      // Initialize with pending filters from stored state if available
      if (storedFilters.length > 0 && pendingFilters.length === 0) {
        setPendingFilters(storedFilters)
      }

      // Load initial autocomplete data
      loadInitialAutocompleteData(newFilters)
    }
  }, [data, loadInitialAutocompleteData, storedFilters, pendingFilters.length])

  const handleFilterChange = async (filter: Filter) => {
    if (filter.type === 'type') {
      const value = filter.value
      refetch({ entity: value })
    } else {
      setPendingFilters((prev) => {
        const existingIndex = prev.findIndex((f) => f.field === filter.field)
        if (existingIndex > -1) {
          const newFilters = [...prev]
          newFilters[existingIndex] = {
            label: filter.label,
            field: filter.field,
            value: filter.value ?? '',
            type: filter.type
          }
          return newFilters
        }
        return [...prev, {
          label: filter.label,
          field: filter.field,
          value: filter.value ?? '',
          type: filter.type
        }]
      })
    }
  }

  const handleApply = () => {
    // Store filters in redux
    dispatch(setFiltersForEntity({ entity: baseEntity, filters: pendingFilters }))
    // Call the parent component's callback
    onApplyFilters(pendingFilters, false)
  }

  const handleClear = () => {
    setPendingFilters([])
    dispatch(clearFiltersForEntity(baseEntity))
    onApplyFilters([], false)
  }

  const removeFilter = (field: string) => {
    setPendingFilters((prev) => prev.filter((f) => f.field !== field))
  }

  const toggleExpanded = (field: string) => {
    setExpandedFilters((prev) => (
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    ))
  }

  const getOptionsForField = (field: string) => {
    return storedAutocompleteOptions[field] || []
  }

  const isFieldLoading = (field: string) => {
    return storedLoadingStates[field] || false
  }

  const renderFilter = (filter: Filter) => {
    switch (filter.type) {
      case "string":
        return (
          <Autocomplete
            fullWidth
            options={getOptionsForField(filter.field)}
            value={pendingFilters.find(f => f.field === filter.field)?.value || null}
            onChange={(_, newValue) => {
              let filterValue = '';
              if (typeof newValue === 'string') {
                filterValue = newValue;
              } else if (newValue && typeof newValue === 'object') {
                filterValue = (newValue as AutoComplete).value;
              }
              handleFilterChange({ ...filter, value: filterValue });
            }}
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
                      {isFieldLoading(filter.field) ? <CircularProgress color="inherit" size={20} /> : null}
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
            value={pendingFilters.find(f => f.field === filter.field)?.value || ''}
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
              value={pendingFilters.find(f => f.field === filter.field)?.value || ''}
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
        if (!isSubFilter) {
          return (
            <FormControl fullWidth margin="normal">
              <InputLabel id={`${filter.field}-label`}>{filter.label}</InputLabel>
              <Select
                labelId={`${filter.field}-label`}
                label={filter.label}
                value={pendingFilters.find(f => f.field === filter.field)?.value || ''}
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
        } else {
          return (
            <InputLabel id={`${filter.field}-label`}>{filter.label}</InputLabel>
          )
        }
    }
  }

  const renderSubFilters = (subFilters: Filter[]) => {
    return (
      <Box>
        {subFilters.map((subFilter) => (
          <FormControl fullWidth margin="normal" key={subFilter.field}>
            <InputLabel id={`${subFilter.field}-label`}>{subFilter.label}</InputLabel>
            <Select
              labelId={`${subFilter.field}-label`}
              label={subFilter.label}
              value={pendingFilters.find(f => f.field === subFilter.field)?.value || ''}
              onChange={(e) => handleFilterChange({ ...subFilter, value: e.target.value as string })}
            >
              {subFilter.autoComplete?.map(({ label, value }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>
    )
  }

  if (loading) return <Typography>Loading filters...</Typography>
  if (error) return <Typography color="error">Error loading filters: {error.message}</Typography>

  return (
    <>
      {!isSubFilter ? (
        <Paper elevation={3} sx={{ width: 300, p: 2 }}>
          {!isSubFilter && (
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
          )}
          {filters.map((filter) => (
            <Box key={filter.field} mb={2}>
              {renderFilter(filter)}
              {filter.subFilters && filter.subFilters.map((subFilter) => (
                <Box key={subFilter.field}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{subFilter.label}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <DynamicFilterPanel
                        key={subFilter.field}
                        baseEntity={subFilter.field}
                        onApplyFilters={onApplyFilters}
                        isSubFilter={true}
                      />
                    </AccordionDetails>
                  </Accordion>
                </Box>
              ))}
            </Box>
          ))}
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>
              Active Filters
            </Typography>
            {pendingFilters.map(({ label, field, value }) => (
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
              disabled={pendingFilters.length === 0}
              fullWidth
            >
              Clear
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Box>
          {renderSubFilters(filters)}
        </Box>
      )}
    </>
  )
}