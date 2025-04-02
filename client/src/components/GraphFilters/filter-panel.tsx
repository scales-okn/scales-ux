import React from "react"

import { Box } from "@mui/material"
import { CaseFilterPanel } from "./case-filter-panel"
import { ChargeFilterPanel } from "./charge-filter-panel"
import { DynamicFilterPanel } from "./dynamic-filter-panel"
interface FilterPanelProps {
  entityType: string
  onApplyFilters: (filters: any) => void
}

export function FilterPanel({ entityType, onApplyFilters }: FilterPanelProps) {
  console.log(entityType)
  return <DynamicFilterPanel baseEntity={entityType} onApplyFilters={onApplyFilters} isSubFilter={false} />
  // Return the appropriate filter panel based on entity type
  // switch (entityType) {
  //   case "Cases":
  //     return <DynamicFilterPanel baseEntity={entityType} />
  //     return <CaseFilterPanel onApplyFilters={onApplyFilters} />
  //   case "Charge":
  //     return <ChargeFilterPanel onApplyFilters={onApplyFilters} />
  //   default:
  //     // Placeholder for other entity types
  //     return <Box sx={{ p: 2 }}>{entityType} filters will be implemented soon.</Box>
  // }
}

