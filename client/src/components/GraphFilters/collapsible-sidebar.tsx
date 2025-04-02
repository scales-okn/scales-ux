import React from "react"
import { useState } from "react"
import { ChevronLeft, Menu, Gavel, LocalPolice, LockClock, Check, FilterList, SquareSharp, Pending, PendingTwoTone, PendingActions } from "@mui/icons-material"
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Collapse,
  useMediaQuery,
  useTheme,
  Badge,
  Tooltip,
} from "@mui/material"
import { DynamicFilterPanel } from "./dynamic-filter-panel"

interface NavItem {
  title: string
  icon: React.ReactNode
  path: string
  field: string
  children?: NavItem[]
  isActive?: boolean
}

const navItems: NavItem[] = [
  {
    title: "Court Cases",
    icon: <Gavel />,
    path: "/",
    isActive: true,
    field: "case",
  },
  {
    title: "Charges",
    icon: <PendingActions />,
    path: "/charges",
    field: "charge",
  },
  {
    title: "Jail Bookings",
    icon: <LockClock />,
    path: "/jail-bookings",
    field: "booking",
  },
  {
    title: "Arrests",
    icon: <LocalPolice />,
    path: "/arrests",
    field: "arrest",
  },
]

const ontologyItems: NavItem[] = [
  {
    title: "Event Labels",
    icon: <Gavel />,
    path: "/ontology",
    field: "eventLabel",
  },
]

// Interface for components that can receive filters
interface WithFiltersProps {
  filters: any;
}

interface CollapsibleSidebarProps {
  children?: React.ReactNode
}

export function CollapsibleSidebar({ children }: CollapsibleSidebarProps) {


  const [expanded, setExpanded] = useState(false)
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<string | null>("Case")
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, number>>({})
  const [filters, setFilters] = useState<any>({})

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const drawerWidth = expanded ? 240 : 64
  const filterDrawerWidth = 320

  const handleToggleSidebar = () => {
    setExpanded(!expanded)
    if (!expanded) {
      // Close any open submenus when collapsing
      setOpenSubMenu(null)
    } else {
      // Close filter panel when collapsing the sidebar
      setShowFilters(false)
    }
  }

  const handleToggleSubMenu = (title: string) => {
    if (openSubMenu === title) {
      setOpenSubMenu(null)
    } else {
      setOpenSubMenu(title)
    }
  }

  const handleEntitySelect = (title: string) => {

    setSelectedEntity(title)
    if (!expanded) {
      setExpanded(true)
    }
    setShowFilters(true)
  }

  const handleApplyFilters = (newFilters: any) => {
    // Count non-empty filters
    const filterCount = Object.keys(newFilters).filter((key) => {
      const value = newFilters[key]
      return value !== null && value !== "" && value !== false
    }).length

    // Update active filters count for the selected entity
    setActiveFilters({
      ...activeFilters,
      [selectedEntity as string]: filterCount,
    })

    // Store the filters to pass to the content panels
    setFilters(newFilters)

    // Close the filter panel on mobile
    if (isMobile) {
      setShowFilters(false)
    }
  }

  const drawer = (
    <div style={{ marginTop: 24 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "space-between" : "center",
          padding: 1,
          marginTop: 4,
        }}
      >
        {expanded && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {expanded && (
              <Box component="span" sx={{ mx: 2, fontWeight: "bold", fontSize: "1.2rem", textAlign: "right" }}>
                IJP Entities
              </Box>
            )}
          </Box>
        )}
        <IconButton onClick={handleToggleSidebar}>{expanded ? <ChevronLeft /> : <Menu />}</IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <React.Fragment key={item.field}>
            <ListItem disablePadding sx={{ display: "block" }}>
              <Tooltip title={expanded ? "" : item.title} placement="right">
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: expanded ? "initial" : "center",
                    px: 2.5,
                    backgroundColor: selectedEntity === item.field ? "rgba(0, 0, 0, 0.08)" : "transparent",
                  }}
                  onClick={() => handleEntitySelect(item.field)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: expanded ? 2 : "auto",
                      justifyContent: "center",
                      color: selectedEntity === item.field ? "primary.main" : "inherit",
                    }}
                  >
                    {activeFilters[item.field] ? (
                      <Badge badgeContent={activeFilters[item.field]} color="primary">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  {expanded && (
                    <ListItemText
                      primary={item.title}
                      sx={{
                        opacity: expanded ? 1 : 0,
                        color: selectedEntity === item.field ? "primary.main" : "inherit",
                      }}
                    />
                  )}
                  {expanded && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowFilters(!showFilters)
                      }}
                    >
                      <FilterList color={activeFilters[item.field] ? "primary" : "inherit"} />
                    </IconButton>
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
            {expanded && item.children && (
              <Collapse in={openSubMenu === item.field} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton key={child.title} sx={{ pl: 4 }}>
                      <ListItemText primary={child.title} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
        <Divider />  <List>
          <ListItemButton>
            <ListItemText primary="IJP Ontologies" />
          </ListItemButton>
        </List>

      </List>
    </div>
  )

  // Create a function to render children with props
  const renderChildrenWithProps = () => {
    // If no children, return null
    if (!children) {
      return null;
    }

    // Handle different types of children
    if (React.isValidElement(children)) {
      // If it's a single element, clone it with the filters prop
      return React.cloneElement(children, { filters } as Partial<WithFiltersProps>);
    } else if (Array.isArray(children)) {
      // If it's an array of elements, map through and clone each one
      return React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { filters } as Partial<WithFiltersProps>);
        }
        return child;
      });
    }

    // If it's neither a valid element nor an array, return as is
    return children;
  };

  return (
    <Box sx={{ display: "flex", position: "relative" }}>
      <Box
        component="nav"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 1200,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={expanded}
            onClose={handleToggleSidebar}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                borderRight: "1px solid rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                borderRight: "1px solid rgba(0, 0, 0, 0.12)",
                transition: theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                overflowX: "hidden",
                zIndex: 1200,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Filter Panel */}
      {!isMobile && (
        <Box
          sx={{
            position: "fixed",
            left: drawerWidth,
            top: 0,
            height: "100%",
            width: filterDrawerWidth,
            zIndex: 1199,
            backgroundColor: "background.paper",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
            display: showFilters ? "block" : "none",
            boxShadow: "1px 0px 10px rgba(0, 0, 0, 0.08)",
            overflow: "auto",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <IconButton onClick={() => setShowFilters(false)}>
              <ChevronLeft />
            </IconButton>
          </Box>
          <Divider />
          {selectedEntity && <DynamicFilterPanel baseEntity={selectedEntity} onApplyFilters={handleApplyFilters} />}
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
          ml: { xs: 0, sm: `${drawerWidth}px` }, // Use the dynamic drawerWidth
          transition: theme.transitions.create(["margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {renderChildrenWithProps()}
      </Box>
    </Box>
  )
}