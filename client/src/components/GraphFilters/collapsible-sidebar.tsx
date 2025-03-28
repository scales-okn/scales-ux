import * as React from "react"
import { useState } from "react"
import { ChevronLeft, Menu, Gavel, LocalPolice, LockClock, Check, FilterList } from "@mui/icons-material"
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
import { FilterPanel } from "./filter-panel"

interface NavItem {
  title: string
  icon: React.ReactNode
  path: string
  children?: NavItem[]
  isActive?: boolean
}

const navItems: NavItem[] = [
  {
    title: "Court Cases",
    icon: <Gavel />,
    path: "/cases",
    isActive: true,
  },
  {
    title: "Charges",
    icon: <Check />,
    path: "/domain",
  },
  {
    title: "Jail Bookings",
    icon: <LockClock />,
    path: "/website",
  },
  {
    title: "Arrests",
    icon: <LocalPolice />,
    path: "/conversations",
  },
]

interface CollapsibleSidebarProps {
  children?: React.ReactNode
}

export function CollapsibleSidebar({ children }: CollapsibleSidebarProps) {
  const [expanded, setExpanded] = useState(false)
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<string | null>("Court Cases")
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, number>>({})

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

  const handleApplyFilters = (filters: any) => {
    // Count non-empty filters
    const filterCount = Object.keys(filters).filter((key) => {
      const value = filters[key]
      return value !== null && value !== "" && value !== false
    }).length

    // Update active filters count for the selected entity
    setActiveFilters({
      ...activeFilters,
      [selectedEntity as string]: filterCount,
    })

    // Here you would typically also update your data based on the filters
    console.log(`Applied ${filterCount} filters for ${selectedEntity}:`, filters)
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
              <Box component="span" sx={{ ml: 1, fontWeight: "bold" }}>
                SCALES
              </Box>
            )}
          </Box>
        )}
        <IconButton onClick={handleToggleSidebar}>{expanded ? <ChevronLeft /> : <Menu />}</IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <React.Fragment key={item.title}>
            <ListItem disablePadding sx={{ display: "block" }}>
              <Tooltip title={expanded ? "" : item.title} placement="right">
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: expanded ? "initial" : "center",
                    px: 2.5,
                    backgroundColor: selectedEntity === item.title ? "rgba(0, 0, 0, 0.08)" : "transparent",
                  }}
                  onClick={() => handleEntitySelect(item.title)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: expanded ? 2 : "auto",
                      justifyContent: "center",
                      color: selectedEntity === item.title ? "primary.main" : "inherit",
                    }}
                  >
                    {activeFilters[item.title] ? (
                      <Badge badgeContent={activeFilters[item.title]} color="primary">
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
                        color: selectedEntity === item.title ? "primary.main" : "inherit",
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
                      <FilterList color={activeFilters[item.title] ? "primary" : "inherit"} />
                    </IconButton>
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
            {expanded && item.children && (
              <Collapse in={openSubMenu === item.title} timeout="auto" unmountOnExit>
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
      </List>
    </div>
  )

  const filterDrawer = (
    <Box
      sx={{
        position: "fixed",
        left: drawerWidth,
        top: 0,
        height: "100%",
        width: filterDrawerWidth,
        zIndex: 1099,
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
      {selectedEntity && <FilterPanel entityType={selectedEntity} onApplyFilters={handleApplyFilters} />}
    </Box>
  )

  return (
    <Box sx={{ display: "flex" }}>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
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
                zIndex: 1100,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Filter Panel Drawer */}
      {!isMobile && filterDrawer}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            sm: `calc(100% - ${drawerWidth}px${showFilters ? ` - ${filterDrawerWidth}px` : ""})`,
          },
          marginLeft: {
            sm: showFilters ? `${drawerWidth + filterDrawerWidth}px` : `${drawerWidth}px`,
          },
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

