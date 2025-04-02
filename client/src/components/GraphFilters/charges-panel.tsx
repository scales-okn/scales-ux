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
    Chip,
} from "@mui/material"
import { useLazyQuery } from "@apollo/client"
import { SEARCH_CHARGES } from "../../graphql/queries"

interface ChargesPanelProps {
    filters?: any
}

export function ChargesPanel({ filters = {} }: ChargesPanelProps) {
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Convert to GraphQL query parameters
    const searchParams = {
        chargeDescription: filters.chargeDescription || null,
        chargeSeverity: filters.chargeSeverity || null,
        chargeStatus: filters.chargeStatus || null,
        filingDateStart: filters.filingDateStart || null,
        filingDateEnd: filters.filingDateEnd || null,
        disposition: filters.disposition || null,
        first: rowsPerPage,
        offset: (page - 1) * rowsPerPage,
        sortBy: "filingDate",
        sortDirection: "DESC",
    }

    const [searchCharges, { loading, data, error }] = useLazyQuery(SEARCH_CHARGES)

    // Fetch data when filters or pagination changes
    useEffect(() => {
        searchCharges({ variables: searchParams })
    }, [filters, page, rowsPerPage, searchCharges])

    const charges = data?.searchCharges?.nodes || []
    const totalCount = data?.searchCharges?.totalCount || 0
    const totalPages = Math.ceil(totalCount / rowsPerPage)

    const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage)
    }

    function formatDate(dateString: string) {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    function getSeverityColor(severity: string) {
        switch (severity?.toLowerCase()) {
            case "felony":
                return "error"
            case "misdemeanor":
                return "warning"
            case "infraction":
                return "info"
            default:
                return "default"
        }
    }

    function getStatusColor(status: string) {
        switch (status?.toLowerCase()) {
            case "pending":
            case "active":
                return "primary"
            case "convicted":
                return "error"
            case "dismissed":
                return "success"
            case "acquitted":
                return "info"
            default:
                return "default"
        }
    }

    return (
        <Box>
            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Error loading charges: {error.message}
                </Alert>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ mb: 4 }}>
                        <Table sx={{ minWidth: 650 }} aria-label="charges table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Charge ID</TableCell>
                                    <TableCell>Case ID</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Severity</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Filing Date</TableCell>
                                    <TableCell>Disposition</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {charges.length > 0 ? (
                                    charges.map((row: any) => (
                                        <TableRow key={row.chargeId} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                            <TableCell component="th" scope="row">
                                                {row.chargeId}
                                            </TableCell>
                                            <TableCell>{row.caseId}</TableCell>
                                            <TableCell>{row.chargeDescription}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.chargeSeverity}
                                                    color={getSeverityColor(row.chargeSeverity) as any}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={row.chargeStatus} color={getStatusColor(row.chargeStatus) as any} size="small" />
                                            </TableCell>
                                            <TableCell>{formatDate(row.filingDate)}</TableCell>
                                            <TableCell>
                                                {row.disposition ? (
                                                    <>
                                                        {row.disposition}
                                                        <br />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDate(row.dispositionDate)}
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No charges found matching the current filters
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {totalCount > 0 && (
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                                Displaying {charges.length} of {totalCount} total charges
                            </Typography>
                            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
                        </Box>
                    )}
                </>
            )}
        </Box>
    )
}

