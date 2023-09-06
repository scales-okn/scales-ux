import * as React from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import NavItem from "./NavItem";

type MobileMenuT = {
  drawerOpen: boolean;
  toggleDrawer: (event: React.KeyboardEvent | React.MouseEvent) => void;
  isAdmin: boolean;
};

const MobileMenu = ({ drawerOpen, toggleDrawer, isAdmin }: MobileMenuT) => {
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
              backgroundColor: "var(--main-purple)",
              height: "100%",
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
