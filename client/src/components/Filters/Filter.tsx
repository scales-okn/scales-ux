import React, { useState, useEffect, useRef } from "react";

import { usePanel } from "src/store/panels";
import { useRing } from "src/store/rings";
import { useSessionUser } from "src/store/auth";

// import { debounce } from "lodash";
import dayjs from "dayjs";
import {
  CircularProgress,
  TextField,
  FormControlLabel,
  Switch,
  Autocomplete,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";
import "@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

import { usStates } from "./usStates";
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

type RangeItemT = Date | null;
type DateRangeT = RangeItemT | [RangeItemT, RangeItemT];

const Filter = ({ panelId, filter }: Props) => {
  const { panel, filters, setPanelFilters, updatePanel } = usePanel(panelId);

  const sessionUser = useSessionUser();
  const sessionUserCanEdit = sessionUser?.id === panel?.userId;

  const { ring, info } = useRing(panel.ringId);
  const { type, id, value } = filter;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState<boolean>(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<
    FilterOptionT[]
  >([]);
  const [autocompleteValues, setAutocompleteValues] = useState([]);

  const [dateValue, setDateValue] = useState<DateRangeT>([null, null]);
  const { notify } = useNotify();

  useEffect(() => {
    setAutocompleteValues([]);
  }, [type]);

  useEffect(() => {
    const values = filter.value
      ?.toString()
      .split("|")
      .map((value) => {
        if (type === "state_abbrev") {
          return usStates.find((state) => state.value === value);
        }
        return { label: value, value };
      });

    const out = filter.value === "" ? [] : values;
    setAutocompleteValues(out);
  }, [filter.value]); // eslint-disable-line react-hooks/exhaustive-deps

  const setFilter = (filter: FilterT) => {
    try {
      const newFilters = filters.map((existingFilter) => {
        if (existingFilter.id === filter.id) {
          return filter;
        }
        return existingFilter;
      });

      setPanelFilters(newFilters);
      updatePanel({ filters: newFilters });
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

  useEffect(() => {
    if (filterOptions?.type === "date") {
      let out;
      if (filter.value) {
        out = filter.value.toString().split(",");
      } else {
        out = [null, null];
      }
      setDateValue(out);
    }
  }, [filter, filterOptions]);

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
    if (sessionUserCanEdit) {
      const newFilters = [
        ...filters.filter((filter: FilterT) => filter.id !== id),
      ];
      setPanelFilters(newFilters);
    }
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
      disabled={!sessionUserCanEdit}
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
        const noFetchFilterTypes = [
          "case_status",
          "ontology_labels",
          "case_type",
          "circuit_abbrev",
        ];

        const minChar = 3;
        if (value.length >= minChar && !noFetchFilterTypes.includes(type)) {
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
        const arr = fieldValue.map((value) => value.value.toString());
        const uniqValues = Array.from(new Set(arr));

        setFilter({
          ...filter,
          value: uniqValues.join("|"),
        });
        autocompleteRef.current?.blur();
      }}
      sx={{
        minWidth: "250px",
        "& .MuiInputBase-root": {
          cursor: sessionUserCanEdit ? "pointer" : "not-allowed",
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
      disabled={!filterOptions?.type || !sessionUserCanEdit}
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
        disabled={!sessionUserCanEdit}
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
        disabled={!sessionUserCanEdit}
        onChange={(value) => {
          const first = dayjs(value[0]).format("YYYY-MM-DD");
          const second = dayjs(value[1]).format("YYYY-MM-DD");

          setDateValue(value);
          setFilter({ ...filter, value: `${first},${second}` });
        }}
        value={dateValue}
        disableCalendar={false}
        disableClock
      />
    </div>
  );

  return (
    <div className={`filter ${filterStyles}`}>
      <div className="filterItem">
        <FilterTypeDropDown
          disabled={!sessionUserCanEdit}
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
            if (type === "state_abbrev") {
              return (
                <StateAutocomplete
                  setFilter={setFilter}
                  filter={filter}
                  disabled={!sessionUserCanEdit}
                  autocompleteValues={autocompleteValues}
                />
              );
            }
            if (filterOptions?.autocomplete) {
              return autocompleteElement;
            }
            return textFieldElement;
          })()}
        </div>
        <div className="closeIcon" onClick={handleClear}>
          <HighlightOffIcon
            sx={{ cursor: sessionUserCanEdit ? "pointer" : "not-allowed" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Filter;
