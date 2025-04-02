import React, { useState, useEffect } from "react";
import { useLazyQuery, gql } from "@apollo/client";
import {
  Box,
  Button,
  Divider,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { CollapsibleSidebar } from "./collapsible-sidebar";

// GraphQL Queries
const GET_AUTOCOMPLETE_DATA = gql`
  query GetAutoCompleteData($field: String!, $value: String!) {
    getAutoCompleteData(field: $field, value: $value)
  }
`;

const SEARCH_CASES = gql`
  query SearchCases(
    $caseStatus: String
    $filingDateStart: DateTime
    $filingDateEnd: DateTime
    $natureSuit: String
    $first: Int
    $offset: Int
    $sortBy: String
    $sortDirection: String
  ) {
    searchCases(
      caseStatus: $caseStatus
      filingDateStart: $filingDateStart
      filingDateEnd: $filingDateEnd
      natureSuit: $natureSuit
      first: $first
      offset: $offset
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      nodes {
        caseId
        caseStatus
        filingDate
        terminatingDate
        natureSuit
        cause
      }
      totalCount
      offset
      first
      hasMore
    }
  }
`;

interface FilterState {
  filingDateStart: string | null;
  filingDateEnd: string | null;
  natureSuit: string;
}

interface CourtCase {
  caseId: string;
  caseStatus: string | null;
  filingDate: string | null;
  terminatingDate: string | null;
  natureSuit: string | null;
  cause: string | null;
}

interface SearchResult {
  nodes: CourtCase[];
  totalCount: number;
  offset: number;
  first: number;
  hasMore: boolean;
}

const CourtCaseFilterPage: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    filingDateStart: null,
    filingDateEnd: null,
    natureSuit: "",
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    offset: 0,
    first: 10,
  });

  // Sorting state
  const [sorting, setSorting] = useState({
    sortBy: "filingDate",
    sortDirection: "DESC" as "ASC" | "DESC",
  });

  // Autocomplete options state
  const [caseStatusOptions, setCaseStatusOptions] = useState<string[]>([]);
  const [natureSuitOptions, setNatureSuitOptions] = useState<string[]>([]);

  const fieldBeingQueried = React.useRef<string | null>(null);

  // Get autocomplete data for a field
  const [getAutoCompleteData] = useLazyQuery(GET_AUTOCOMPLETE_DATA, {
    onCompleted: (data) => {
      const options = data.getAutoCompleteData;
      if (fieldBeingQueried.current === "caseStatus") {
        setCaseStatusOptions(options);
      } else if (fieldBeingQueried.current === "natureSuit") {
        setNatureSuitOptions(options);
      }
    },
  });

  const fetchAutoCompleteOptions = (field: string, value: string) => {
    console.log("Fetching autocomplete data for", field, value);
    fieldBeingQueried.current = field; // Store the field in ref instead of state
    getAutoCompleteData({
      variables: {
        field,
        value,
      },
    });
  };

  // Search cases query
  const [searchCases, { loading, data }] = useLazyQuery<{
    searchCases: SearchResult;
  }>(SEARCH_CASES);

  // Keep track of which field we're getting autocomplete data for
  // const [currentField, setCurrentField] = useState<string | null>(null);

  // Get filter options on component mount
  useEffect(() => {
    fetchAutoCompleteOptions("caseStatus", "");
    fetchAutoCompleteOptions("natureSuit", "");
  }, []);

  // const fetchAutoCompleteOptions = (field: string, value: string) => {
  //   console.log("Fetching autocomplete data for", field, value);
  //   setCurrentField(field);
  //   getAutoCompleteData({
  //     variables: {
  //       field,
  //       value,
  //     },
  //   });
  // };

  // Handle filter changes
  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };

  // Reset all filters
  const handleReset = () => {
    setFilters({
      filingDateStart: null,
      filingDateEnd: null,
      natureSuit: "",
    });
  };

  // Apply filters - now internal to the component
  const handleApplyFilters = () => {
    // Reset pagination when applying new filters
    setPagination({
      ...pagination,
      offset: 0,
    });

    // Convert string dates to Date objects for the GraphQL query
    const formattedFilters = {
      ...filters,
      filingDateStart: filters.filingDateStart
        ? new Date(filters.filingDateStart)
        : null,
      filingDateEnd: filters.filingDateEnd
        ? new Date(filters.filingDateEnd)
        : null,
    };

    // Execute the search
    searchCases({
      variables: {
        ...formattedFilters,
        offset: 0, // Reset to first page
        first: pagination.first,
        ...sorting,
      },
    });
  };

  // Handle pagination
  const handleNextPage = () => {
    if (!data || !data.searchCases.hasMore) return;

    const newOffset = pagination.offset + pagination.first;
    setPagination({
      ...pagination,
      offset: newOffset,
    });

    // Convert string dates to Date objects for the GraphQL query
    const formattedFilters = {
      ...filters,
      filingDateStart: filters.filingDateStart
        ? new Date(filters.filingDateStart)
        : null,
      filingDateEnd: filters.filingDateEnd
        ? new Date(filters.filingDateEnd)
        : null,
    };

    // Re-fetch with new pagination
    searchCases({
      variables: {
        ...formattedFilters,
        offset: newOffset,
        first: pagination.first,
        ...sorting,
      },
    });
  };

  const handlePrevPage = () => {
    if (pagination.offset === 0) return;

    const newOffset = Math.max(0, pagination.offset - pagination.first);
    setPagination({
      ...pagination,
      offset: newOffset,
    });

    // Convert string dates to Date objects for the GraphQL query
    const formattedFilters = {
      ...filters,
      filingDateStart: filters.filingDateStart
        ? new Date(filters.filingDateStart)
        : null,
      filingDateEnd: filters.filingDateEnd
        ? new Date(filters.filingDateEnd)
        : null,
    };

    // Re-fetch with new pagination
    searchCases({
      variables: {
        ...formattedFilters,
        offset: newOffset,
        first: pagination.first,
        ...sorting,
      },
    });
  };

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <CollapsibleSidebar>
      <Box sx={{ display: "flex", height: "100vh" }}>
        {/* Filter Panel */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            width: 300,
            height: "100%",
            borderRight: "1px solid #e0e0e0",
            overflowY: "auto",
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h6">Filters</Typography>
            <Divider />

            {/* Case Status Filter */}
            {/* <FormControl fullWidth>
            <InputLabel id="case-status-label">Case Status</InputLabel>
            <Select
              labelId="case-status-label"
              value={filters.caseStatus}
              label="Case Status"
              onChange={(e) => handleFilterChange("caseStatus", e.target.value)}
            >
              <MenuItem value="">
                <em>Any</em>
              </MenuItem>
              {caseStatusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}

            {/* Filing Date Range */}
            <Typography variant="subtitle2" gutterBottom>
              Filing Date Range
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Start Date"
                type="date"
                value={filters.filingDateStart || ""}
                onChange={(e) =>
                  handleFilterChange("filingDateStart", e.target.value)
                }
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={filters.filingDateEnd || ""}
                onChange={(e) =>
                  handleFilterChange("filingDateEnd", e.target.value)
                }
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                inputProps={{
                  min: filters.filingDateStart || undefined,
                }}
              />
            </Stack>

            {/* Nature of Suit Filter */}
            <FormControl fullWidth>
              <InputLabel id="nature-suit-label">Nature of Suit</InputLabel>
              <Select
                labelId="nature-suit-label"
                value={filters.natureSuit}
                label="Nature of Suit"
                onChange={(e) => handleFilterChange("natureSuit", e.target.value)}
              >
                <MenuItem value="">
                  <em>Any</em>
                </MenuItem>
                {natureSuitOptions.map((suit) => (
                  <MenuItem key={suit} value={suit}>
                    {suit}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                variant="contained"
                color="primary"
                sx={{ width: "48%" }}
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                sx={{ width: "48%" }}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Results Area */}
        <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Court Cases
          </Typography>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : data ? (
            <>
              {/* Results count */}
              <Typography variant="body2" sx={{ mb: 2 }}>
                Showing {data.searchCases.offset + 1} -{" "}
                {Math.min(
                  data.searchCases.offset + data.searchCases.nodes.length,
                  data.searchCases.totalCount,
                )}{" "}
                of {data.searchCases.totalCount} cases
              </Typography>

              {/* Results Table */}
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Case ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Filing Date</TableCell>
                      <TableCell>Terminating Date</TableCell>
                      <TableCell>Nature of Suit</TableCell>
                      <TableCell>Cause</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.searchCases.nodes.map((caseItem) => (
                      <TableRow key={caseItem.caseId}>
                        <TableCell>{caseItem.caseId}</TableCell>
                        <TableCell>{caseItem.caseStatus || "-"}</TableCell>
                        <TableCell>{formatDate(caseItem.filingDate)}</TableCell>
                        <TableCell>
                          {formatDate(caseItem.terminatingDate)}
                        </TableCell>
                        <TableCell>{caseItem.natureSuit || "-"}</TableCell>
                        <TableCell>{caseItem.cause || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination Controls */}
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  onClick={handlePrevPage}
                  disabled={pagination.offset === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleNextPage}
                  disabled={!data.searchCases.hasMore}
                >
                  Next
                </Button>
              </Stack>
            </>
          ) : (
            <Typography>Use the filters to search for court cases.</Typography>
          )}
        </Box>
      </Box>
    </CollapsibleSidebar>
  );
};

export default CourtCaseFilterPage;
