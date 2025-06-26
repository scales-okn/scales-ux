import * as React from "react";

import {
  Box,
  SwipeableDrawer,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
} from "@mui/material";

import NavItem from "./NavItem";

type MobileMenuT = {
  drawerOpen: boolean;
  toggleDrawer: (event: React.KeyboardEvent | React.MouseEvent) => void;
  isAdmin: boolean;
};

const MobileMenu = ({ drawerOpen, toggleDrawer, isAdmin }: MobileMenuT) => {
  const theme = useTheme();
  return (
    <div>
      <>
        <SwipeableDrawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          onOpen={toggleDrawer}
        >
          <Box
            sx={{
              width: 250,
              backgroundColor: theme.palette.info.dark,
              height: "100%",
              marginTop: "64px",
            }}
            role="presentation"
            onClick={toggleDrawer}
            onKeyDown={toggleDrawer}
          >
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <img
                        alt="logo"
                        className="logo"
                        src="/ScalesLogoSmall.png"
                        style={{ width: "50%", marginLeft: "50px" }}
                        onClick={toggleDrawer}
                      />
                    }
                  />
                </ListItemButton>
              </ListItem>
            </List>
            <Divider />
            <List sx={{ margin: "24px", marginLeft: "32px" }}>
              <NavItem linkName="Notebooks" route={"/"} isMobile />
              <NavItem linkName="Connections" route={"/connections"} isMobile />
              {isAdmin && (
                <NavItem
                  key={"admin"}
                  linkName={"admin"}
                  route={"/admin/rings"}
                  isMobile
                />
              )}
            </List>
          </Box>
        </SwipeableDrawer>
      </>
    </div>
  );
};

export default MobileMenu;
