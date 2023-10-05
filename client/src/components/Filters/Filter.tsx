import React, { useState, useEffect, useRef } from "react";

import { usePanel } from "src/store/panels";
import { useRing } from "src/store/rings";

import { debounce } from "lodash";

import {
  CircularProgress,
  TextField,
  FormControlLabel,
  Switch,
  Autocomplete,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";

import useDebounce from "src/hooks/useDebounce";
import { DATE_FORMAT } from "src/helpers/constants";
import { makeRequest } from "src/helpers/makeRequest";
import { useNotify } from "src/components/Notifications";
import FilterTypeDropDown from "./FilterTypeDropDown";
import StateAutocomplete from "./StateAutocomplete";

import { filterStyles } from "./styles";

export type FilterT = {
  id: string;
  value: string | number;
  type: string;
};

type FilterOptionT = {
  label: string;
  value: string;
};

type Props = {
  filter: FilterT;
  panelId: string;
};

const Filter = ({ panelId, filter }: Props) => {
  const { panel, filters, setPanelFilters } = usePanel(panelId);

  const { ring, info } = useRing(panel.ringId);
  const { type, id, value } = filter;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState<boolean>(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<
    FilterOptionT[]
  >([]);
  const [autocompleteValues, setAutocompleteValues] = useState([]);
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const { notify } = useNotify();

  useEffect(() => {
    setAutocompleteValues([]);
  }, [type]);

  useEffect(() => {
    const activeFilter = filters.find((filter) => filter.type === type);
    const values = activeFilter.value.split("|").map((value) => {
      return { label: value, value: value };
    });
    const out = activeFilter.value === "" ? [] : values;
    setAutocompleteValues(out);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setFilter = (filter: FilterT) => {
    try {
      const newFilters = filters.map((existingFilter) => {
        if (existingFilter.id === filter.id) {
          return filter;
        }
        return existingFilter;
      });

      setPanelFilters(newFilters);
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
    }
  };

  const getFilterOptionsByKey = (key) => {
    if (!key) return null;

    try {
      return info?.filters?.find((filter) => filter.includes(key))[1];
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
    }
  };

  const getFiltersNormalized = () => {
    try {
      return info?.filters
        .map((filter) => ({ key: filter[0], ...filter[1] }))
        .sort((a, b) => a.key.localeCompare(b.key));
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
    }
  };

  const filterOptions = getFilterOptionsByKey(type);

  const fetchAutocompleteSuggestions = async (query) => {
    setIsLoading(true);
    try {
      const response = await makeRequest.get(
        `/proxy/autocomplete/${ring.rid}/${ring.version}/${info?.defaultEntity}/${filter.type}?query=${query}`,
      );

      if (response) {
        setAutoCompleteSuggestions(response);
        setIsLoading(false);
      } else {
        notify("Could not fetch autocomplete suggestions", "error");
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      notify("Could not fetch autocomplete suggestions", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const barredFilterTypes = ["range", "boolean", "date"];
  const isAutocomplete = !barredFilterTypes.includes(filterOptions?.type);

  const resetAndSearch = (searchParams) => {
    setAutoCompleteSuggestions([]);
    if (
      filter.type &&
      isAutocomplete &&
      type !== "state_abbrev" &&
      info?.defaultEntity
    ) {
      fetchAutocompleteSuggestions(searchParams);
    }
  };

  const [rawSearch, setRawSearch] = useState("");
  const debouncedSearch = useDebounce(rawSearch, 1000);
  useEffect(() => {
    resetAndSearch(debouncedSearch);
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    resetAndSearch("");
  }, [filter.type]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClear = async () => {
    const newFilters = [
      ...filters.filter((filter: FilterT) => filter.id !== id),
    ];
    setPanelFilters(newFilters);
  };

  const rangeInputElement = (
    <>
      <TextField
        placeholder="min"
        type="number"
        InputProps={{ inputProps: { min: 0 } }}
        className="filter-range-input"
      />
      <TextField
        placeholder="max"
        type="number"
        InputProps={{ inputProps: { max: 99999 } }}
        className="filter-range-input"
      />
    </>
  );

  const autocompleteRef = useRef(null);

  const autocompleteElement = (
    <Autocomplete
      open={autocompleteOpen}
      noOptionsText={isLoading ? <CircularProgress /> : <>No Results Found</>}
      multiple
      value={autocompleteValues}
      options={autoCompleteSuggestions || []}
      getOptionLabel={(option: FilterOptionT) => option.label}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={filterOptions?.nicename}
          inputRef={autocompleteRef}
          sx={{ textTransform: "capitalize" }}
        />
      )}
      disableClearable
      onInputChange={(_, value) => {
        // We get all options on load, don't server autocomplete for:
        const localFilterTypes = [
          "case_status",
          "ontology_labels",
          "case_type",
          "circuit_abbrev",
        ];

        const minChar = 3;
        if (value.length >= minChar && !localFilterTypes.includes(type)) {
          setRawSearch(value);
          setIsLoading(true);
        }
        if (!autocompleteOpen) setAutocompleteOpen(true);
      }}
      onClose={() => {
        setAutocompleteOpen(false);
      }}
      onFocus={() => {
        setAutocompleteOpen(true);
        if (autoCompleteSuggestions.length === 0 && !!filter?.type) {
          fetchAutocompleteSuggestions("");
          setIsLoading(true);
        }
      }}
      onChange={(_, fieldValue) => {
        if (!filter) {
          return false;
        }
        setFilter({
          ...filter,
          value: fieldValue.map((x) => x.value).join("|"),
        });
        setAutocompleteValues(fieldValue);
        autocompleteRef.current?.blur();
      }}
      sx={{
        minWidth: "250px",

        "& .MuiInputBase-root": {
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
  );

  const textFieldElement = (
    <TextField
      disabled={!filterOptions?.type}
      onChange={(event) => {
        if (!filter) {
          return false;
        }
        setFilter({ ...filter, value: event.target.value });
      }}
      value={value}
      variant="outlined"
      placeholder={filterOptions?.type ? null : "Choose a filter type"}
      sx={{ "& .MuiInputBase-root": { borderRadius: "0 4px 4px 0" } }}
    />
  );

  const switchElement = (
    <div className="switchElement">
      <FormControlLabel
        control={
          <Switch
            checked={filter?.value === "true"}
            onChange={(event) => {
              setFilter({
                ...filter,
                value: event.target.checked ? "true" : "false",
              });
            }}
            name={filterOptions?.nicename}
            color="primary"
          />
        }
        label={filterOptions?.nicename}
      />
    </div>
  );

  const datePickerElement = (
    <div className="dateRangePickerElement">
      <div className="rangeLabel">{filterOptions?.nicename}</div>
      <DateTimeRangePicker
        format={DATE_FORMAT}
        onChange={(value) => {
          setDateValue(value);
          setFilter({ ...filter, value: value });
        }}
        value={dateValue}
      />
    </div>
  );

  return (
    <div className={`filter ${filterStyles}`}>
      <div className="filterItem">
        <FilterTypeDropDown
          filter={filter}
          getFilterOptionsByKey={getFilterOptionsByKey}
          filters={filters}
          getFiltersNormalized={getFiltersNormalized}
          setFilter={setFilter}
        />
        <div>
          {(() => {
            if (filterOptions?.type === "range") {
              return rangeInputElement;
            }
            if (filterOptions?.type === "boolean") {
              return switchElement;
            }
            if (filterOptions?.type === "date") {
              return datePickerElement;
            }
            if (filterOptions?.nicename === "Court State") {
              return (
                <StateAutocomplete setFilter={setFilter} filter={filter} />
              );
            }
            if (filterOptions?.autocomplete) {
              return autocompleteElement;
            }
            return textFieldElement;
          })()}
        </div>
        <div className="closeIcon" onClick={handleClear}>
          <HighlightOffIcon />
        </div>
      </div>
    </div>
  );
};

export default Filter;
