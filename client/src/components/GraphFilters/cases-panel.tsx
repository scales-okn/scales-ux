import React, { useState, useEffect } from "react"
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    CircularProgress,
    Pagination,
} from "@mui/material"
import { useLazyQuery } from "@apollo/client"
import { SEARCH_CASES } from "../../graphql/queries"

interface EntityPanelProps {
    filters?: any
    entityType: string
    setEntityType: React.Dispatch<React.SetStateAction<string>>
}

export function EntityPanel({ filters = {}, entityType, setEntityType }: EntityPanelProps): JSX.Element {
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Convert to GraphQL query parameters
    const searchParams = {
        caseStatus: filters.caseStatus || null,
        filingDateStart: filters.filingDateStart || null,
        filingDateEnd: filters.filingDateEnd || null,
        natureSuit: filters.natureSuit || null,
        first: rowsPerPage,
        offset: (page - 1) * rowsPerPage,
        sortBy: "filingDate",
        sortDirection: "DESC",
    }

    const [searchCases, { loading, data, error }] = useLazyQuery(SEARCH_CASES)

    // Fetch data when filters or pagination changes
    useEffect(() => {
        searchCases({ variables: searchParams })
    }, [filters, page, rowsPerPage, searchCases])

    const courtCases = data?.searchCases?.nodes || []
    const totalCount = data?.searchCases?.totalCount || 0
    const totalPages = Math.ceil(totalCount / rowsPerPage)

    const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage)
    }

    function formatDate(dateString: string) {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    return (
        <Box>
            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Error loading cases: {error.message}
                </Alert>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ mb: 4 }}>
                        <Table sx={{ minWidth: 650 }} aria-label="court cases table">
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
                                {courtCases.length > 0 ? (
                                    courtCases.map((row: any) => (
                                        <TableRow key={row.caseId} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                            <TableCell component="th" scope="row">
                                                {row.caseId}
                                            </TableCell>
                                            <TableCell>{row.caseStatus || "N/A"}</TableCell>
                                            <TableCell>{formatDate(row.filingDate)}</TableCell>
                                            <TableCell>{formatDate(row.terminatingDate)}</TableCell>
                                            <TableCell>{row.natureSuit || "N/A"}</TableCell>
                                            <TableCell>{row.cause || "N/A"}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No cases found matching the current filters
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {totalCount > 0 && (
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                                Displaying {courtCases.length} of {totalCount} total cases
                            </Typography>
                            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
                        </Box>
                    )}
                </>
            )}
        </Box>
    )
}

