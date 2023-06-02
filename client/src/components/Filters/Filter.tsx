import React, { useState } from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";
import FilterTypeDropDown from "./FitlerTypeDropDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import { debounce } from "lodash";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { usePanel } from "../../store/panels";
import { useRing } from "../../store/rings";
import { DATE_FORMAT } from "../../constants";
import { useNotify } from "../../components/Notifications";

export type FilterT = {
  id: string;
  value: string | number;
  type: string;
};

type Props = {
  filter: FilterT;
  panelId: string;
};

const Filter = ({ panelId, filter }: Props) => {
  const { panel, filters, setPanelFilters, getPanelResults } = usePanel(panelId);
  const { ring, info } = useRing(panel.ringId);
  const { type, id, value } = filter;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState<boolean>(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([]);
  const [dateValue, setDateValue] = useState<string>("");
  const { notify } = useNotify();

  const setFilter = (filter: FilterT) => {
    try {
      const newFilters = [...filters.filter((prevFilterInput: FilterT) => prevFilterInput.id !== filter.id), { ...filter }];
      setPanelFilters(newFilters);
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
    }
  };

  // const getFilterInputById = (id: string) => {
  //   try {
  //     return filters?.find((filter: Filter) => filter.id === id);
  //   } catch (error) {
  //     console.warn(error); // eslint-disable-line no-console
  //   }
  // };

  // const getFilterColumnByKey = (key: string) => {
  //   try {
  //     return info?.columns?.find((column) => column.key === key);
  //   } catch (error) {
  //     console.warn(error); // eslint-disable-line no-console
  //   }
  // };

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
      return info?.filters.map((filter) => ({ key: filter[0], ...filter[1] })).sort((a, b) => a.key.localeCompare(b.key));
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
    }
  };

  // const filterColumn = getFilterColumnByKey(type);
  const filterOptions = getFilterOptionsByKey(type);

  const fetchAutocompleteSuggestions = async (query) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/proxy/autocomplete/${ring.rid}/1/${info?.defaultEntity}/${filter.type}?query=${query}`);
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

  const debouncedSearch = debounce((value) => fetchAutocompleteSuggestions(value), 200);

  const handleClear = async () => {
    const newFilters = [...filters.filter((filter: FilterT) => filter.id !== id)];
    setPanelFilters(newFilters);
    getPanelResults(newFilters);
  };

  const filterTypeRange = (
    <>
      <FormControl placeholder="min" min="0" type="number" className="filter-range-input" />
      <InputGroup.Text>-</InputGroup.Text>
      <FormControl placeholder="max" type="number" max="99999" className="filter-range-input" />
    </>
  );

  const filterTypeRender = () => {
    switch (filterOptions?.type) {
      case "range":
        return filterTypeRange;

      case "date":
        return (
          <DateTimeRangePicker
            format={DATE_FORMAT}
            onChange={(value) => {
              setDateValue(value);
              setFilter({ ...filter, value: value });
            }}
            value={dateValue}
          />
        );

      default:
        return (
          <div>
            {filterOptions?.autocomplete ? (
              <Autocomplete
                open={autocompleteOpen}
                noOptionsText={isLoading ? <CircularProgress /> : <>No Results Found</>}
                multiple
                options={autoCompleteSuggestions || []}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} variant="outlined" label={filterOptions?.nicename} />}
                disableClearable
                onInputChange={(_, value) => {
                  debouncedSearch(value);
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
                  setFilter({ ...filter, value: fieldValue.join("|") });
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
            ) : filter.type === "causeOfAction" ? (
              filterTypeRange
            ) : (
              <FormControl
                disabled={!filterOptions?.type}
                className="border-end-0"
                size="sm"
                style={{ height: "56px" }}
                onChange={(event) => {
                  if (!filter) {
                    return false;
                  }
                  setFilter({ ...filter, value: event.target.value });
                }}
                value={value}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="d-inline-block me-3">
      <InputGroup className="mb-3" style={{ display: "flex", flexWrap: "nowrap" }}>
        <InputGroup.Text className="bg-white">
          <FilterTypeDropDown filter={filter} getFilterOptionsByKey={getFilterOptionsByKey} filters={filters} getFiltersNormalized={getFiltersNormalized} setFilter={setFilter} />
        </InputGroup.Text>
        {filterTypeRender()}
        <InputGroup.Text className="cursor-pointer bg-transparent" onClick={handleClear}>
          <FontAwesomeIcon icon={faTimesCircle} className="text-muted" />
        </InputGroup.Text>
      </InputGroup>
    </div>
  );
};

export default Filter;
