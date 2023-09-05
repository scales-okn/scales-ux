import React, { useState } from "react";
import { useSelector } from "react-redux";

import { authSelector } from "store/auth";
import { usePanel } from "store/panels";
import { useRing } from "store/rings";

import { debounce } from "lodash";

import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";

import { DATE_FORMAT } from "helpers/constants";
import { authorizationHeader } from "utils";

import { useNotify } from "components/Notifications";
import FilterTypeDropDown from "./FilterTypeDropDown";

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
  const { panel, filters, setPanelFilters, getPanelResults } =
    usePanel(panelId);
  const { ring, info } = useRing(panel.ringId);
  const { token } = useSelector(authSelector);
  const { type, id, value } = filter;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState<boolean>(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<
    FilterOptionT[]
  >([]);
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const { notify } = useNotify();

  const setFilter = (filter: FilterT) => {
    try {
      const newFilters = [
        ...filters.filter(
          (prevFilterInput: FilterT) => prevFilterInput.id !== filter.id,
        ),
        { ...filter },
      ];
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
    const authHeader = authorizationHeader(token);
    try {
      const response = await fetch(
        `/proxy/autocomplete/${ring.rid}/${ring.version}/${info?.defaultEntity}/${filter.type}?query=${query}`,
        {
          headers: {
            ...authHeader,
          },
        },
      );
      if (response.status === 200) {
        const data = await response.json();
        setAutoCompleteSuggestions(data);
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

  const debouncedSearch = debounce(fetchAutocompleteSuggestions, 1500);

  const handleClear = async () => {
    const newFilters = [
      ...filters.filter((filter: FilterT) => filter.id !== id),
    ];
    setPanelFilters(newFilters);
    getPanelResults(newFilters);
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

  const autocompleteElement = (
    <Autocomplete
      open={autocompleteOpen}
      noOptionsText={isLoading ? <CircularProgress /> : <>No Results Found</>}
      multiple
      options={autoCompleteSuggestions || []}
      getOptionLabel={(option: FilterOptionT) => option.label}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={filterOptions?.nicename}
        />
      )}
      disableClearable
      onInputChange={(_, value) => {
        const minChar = [
          "case_type",
          "state_abbrev",
          "circuit_abbrev",
        ].includes(filter.type)
          ? 0
          : 2;

        if (value.length > minChar) {
          debouncedSearch(value);
          setIsLoading(true);
        }
        if (value.length === 0) {
          if (autocompleteOpen) setAutocompleteOpen(false);
        } else {
          if (!autocompleteOpen) setAutocompleteOpen(true);
        }
      }}
      onClose={() => setAutocompleteOpen(false)}
      onChange={(_, fieldValue) => {
        if (!filter) {
          return false;
        }
        setFilter({
          ...filter,
          value: fieldValue.map((x) => x.value).join("|"),
        });
      }}
      sx={{
        minWidth: "250px",

        "& .MuiInputBase-root": {
          borderRadius: "0",
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
