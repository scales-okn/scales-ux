import React, { useState } from "react"
import { Typography } from "@mui/material"
import { CollapsibleSidebar } from "./collapsible-sidebar"
import { EntityPanel } from "./cases-panel"

export function Dashboard(): React.ReactElement {
    const [filters, setFilters] = useState({})
    const [entityType, setEntityType] = useState("Case")

    const handleApplyFilters = (newFilters: any) => {
        setFilters(newFilters)
    }

    return (
        <CollapsibleSidebar>
            <Typography variant="h4" component="h1" gutterBottom>
                Court Cases
            </Typography>

            <Typography variant="body1" paragraph>
                View and filter court cases in the system. Use the sidebar filters to narrow your search.
            </Typography>

            <EntityPanel filters={filters} entityType={entityType} setEntityType={setEntityType} />
        </CollapsibleSidebar>
    )
}

