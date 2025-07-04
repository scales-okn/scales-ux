import React, { ReactNode, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import { sessionUserSelector } from "src/store/auth";
import useWindowSize from "src/hooks/useWindowSize";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";

import FeedbackWidget from "./FeedbackWidget";
import MobileMenu from "./MobileMenu";
import NavItem from "./NavItem";
import Logout from "./LogoutMenu";
import Alerts from "./Alerts";

import { styles } from "./styles";
import { Button, useTheme } from "@mui/material";

type PageLayoutT = {
  pageTitle?: string;
  id?: string;
  children: ReactNode;
};

const PageLayout = ({ id = "", children, pageTitle }: PageLayoutT) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setDrawerOpen((prev) => !prev);

    return null;
  };

  const theme = useTheme();
  const location = useLocation();
  const isSignInView = location.pathname.includes("sign-in");
  const isAdminView = location.pathname.includes("admin");
  const isConnectionsView = location.pathname.includes("connections");
  const user = useSelector(sessionUserSelector);
  const isAdmin = user?.role === "admin";

  const { width } = useWindowSize();
  const isTablet = width < 768;

  return (
    <>
      <div className={`app-page ${styles}`} id={id}>
        <Box
          sx={{
            maxHeight: "85px",
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: "221000",
          }}
        >
          <AppBar
            position="static"
            sx={{
              background: theme.palette.info.dark,
              color: theme.palette.info.main,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 24px",
              height: "64px !important",
              zIndex: "9001",
            }}
          >
              {isTablet ? (
                <MenuIcon
                  onClick={toggleDrawer}
                  fontSize="large"
                  sx={{ marginTop: "6px", width: "40px" }}
                />
              ) : (
                <Link to="/">
                  <img
                    alt="logo"
                    className="logo"
                    src={"/ScalesLogo.png"}
                    height={50}
                  />
                </Link>
              )}
            {!isTablet && (
              <Toolbar
                sx={{
                  flexGrow: "3",
                  marginLeft: "20px",
                  display: "flex",
                  ...(user ? {} : { justifyContent: "flex-end" }),
                }}
              >
                {user ? (
                  <>
                    <NavItem linkName="Notebooks" route={"/"} />
                    <NavItem linkName="Connections" route={"/connections"} />
                    {isAdmin && (
                      <NavItem
                        key={"admin"}
                        linkName={"admin"}
                        route={"/admin"}
                      />
                    )}
                  </>
                ) : (
                  <NavItem
                    linkName={`Sign ${isSignInView ? "Up" : "In"}`}
                    route={`/sign-${isSignInView ? "up" : "in"}`}
                    disableUnderline
                  />
                )}
              </Toolbar>
            )}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Alerts />
              <Logout />
            </Box>
          </AppBar>
        </Box>

        <Box
          id="main"
          className="main"
          sx={{
            minHeight: "70vh",
            padding: "0 5%",
            maxWidth: "3000px",
            margin: "0 auto",
            marginTop: "128px",
            ...((isAdminView || isConnectionsView) && {
              marginTop: "64px",
              maxWidth: "100% !important",
              padding: "0 !important",
            }),
          }}
        >
          {pageTitle && <h4>{pageTitle}</h4>}
          {children}
        </Box>
      </div>
      {isTablet && (
        <MobileMenu
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          isAdmin={isAdmin}
        />
      )}

      <FeedbackWidget />
    </>
  );
};

export default PageLayout;
