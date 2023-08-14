import React, { ReactNode, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { userSelector } from "../../store/auth";
import useWindowSize from "hooks/useWindowSize";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";

import FeedbackWidget from "./FeedbackWidget";
import MobileMenu from "./MobileMenu";
import NavItem from "./NavItem";
import Logout from "./LogoutMenu";
import { styles } from "./styles";

import "./PageLayout.scss";

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

  const user = useSelector(userSelector);
  const isAdmin = user?.role === "admin";

  const { width } = useWindowSize();
  const isTablet = width < 900;

  return (
    <>
      <div className={`app-page ${styles}`} id={id}>
        <Box
          sx={{
            maxHeight: "85px",
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: "1000",
          }}
        >
          <AppBar
            position="static"
            sx={{
              backgroundColor: "var(--main-purple)",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 24px",
            }}
          >
            <IconButton
              size="small"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ width: isTablet ? "40px" : "160px" }}
            >
              {isTablet ? (
                <MenuIcon onClick={toggleDrawer} fontSize="large" />
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
            </IconButton>
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
                    {isAdmin &&
                      ["rings", "users", "feedback"].map((title) => {
                        return (
                          <NavItem
                            key={title}
                            linkName={title}
                            route={`/${title}`}
                          />
                        );
                      })}
                  </>
                ) : (
                  <NavItem
                    linkName="Sign In"
                    route={"/sign-in"}
                    disableUnderline
                  />
                )}
              </Toolbar>
            )}
            <Logout />
          </AppBar>
        </Box>
        <Container id="main" className="main" sx={{ paddingTop: "80px" }}>
          {pageTitle && <h4>{pageTitle}</h4>}
          {children}
        </Container>
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
