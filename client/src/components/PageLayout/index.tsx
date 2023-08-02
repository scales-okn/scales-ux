import React, { FunctionComponent, ReactNode, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

import { userSelector, logout } from "../../store/auth";
import useWindowSize from "hooks/useWindowSize";

import * as S from "./styles";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import { Navbar, Nav, Dropdown } from "react-bootstrap";
import FeedbackWidget from "./FeedbackWidget";
import { LinkContainer } from "react-router-bootstrap";

import "./PageLayout.scss";

import Avatar from "react-avatar";

type Props = {
  pageTitle?: string;
  id?: string;
  children: ReactNode;
};

const PageLayout: FunctionComponent<Props> = (props) => {
  const { id = "", children, pageTitle } = props;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  const location = useLocation();
  const { pathname } = location;
  const isAdmin = user?.role === "admin";

  const { width } = useWindowSize();
  const isTablet = width < 992;

  const brand = isTablet ? (
    <S.Logo
      src="/ScalesLogoSmall.png"
      style={{ width: 60 }}
      onClick={() => setDrawerOpen(true)}
    />
  ) : (
    <S.Logo src="/ScalesLogo.png" style={{ width: 247 }} />
  );

  const list = (
    <Box
      role="presentation"
      sx={{
        width: "200px",
        height: "100%",
        background: "var(--main-purple)",
        padding: "40px 20px",
      }}
      onClick={() => setDrawerOpen(false)}
      onKeyDown={() => setDrawerOpen(false)}
    >
      {user && (
        <>
          <LinkContainer to="/">
            <S.NavItem active={pathname === "/"}>Notebooks</S.NavItem>
          </LinkContainer>
          <S.Divider />
          {isAdmin && (
            <>
              <LinkContainer to="/rings">
                <S.NavItem active={pathname === "/rings"}>Rings</S.NavItem>
              </LinkContainer>
              <S.Divider />
              <LinkContainer to="/users">
                <S.NavItem active={pathname === "/users"}>Users</S.NavItem>
              </LinkContainer>
              <S.Divider />
              <LinkContainer to="/feedback">
                <S.NavItem active={pathname === "/feedback"}>
                  Feedback
                </S.NavItem>
              </LinkContainer>
            </>
          )}
        </>
      )}
    </Box>
  );

  return (
    <>
      <div className="app-page" id={id}>
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {list}
        </Drawer>
        <Navbar
          style={{
            backgroundColor: "var(--main-purple)",
            maxHeight: "80px",
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: "1000",
          }}
          className="mb-4 py-3"
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              padding: "0 18px",
            }}
          >
            <Navbar.Brand style={{ marginRight: isTablet ? "2rem" : "1rem" }}>
              {brand}
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse
              id="responsive-navbar-nav"
              style={{ justifyContent: "flex-end" }}
            >
              {user ? (
                <>
                  {!isTablet && (
                    <Nav className="me-auto">
                      <LinkContainer to="/">
                        <S.NavItem active={pathname === "/"}>
                          Notebooks
                        </S.NavItem>
                      </LinkContainer>
                      {isAdmin && (
                        <>
                          <LinkContainer to="/rings">
                            <S.NavItem active={pathname === "/rings"}>
                              Rings
                            </S.NavItem>
                          </LinkContainer>
                          <LinkContainer to="/users">
                            <S.NavItem active={pathname === "/users"}>
                              Users
                            </S.NavItem>
                          </LinkContainer>
                          <LinkContainer to="/feedback">
                            <S.NavItem active={pathname === "/feedback"}>
                              Feedback
                            </S.NavItem>
                          </LinkContainer>
                        </>
                      )}
                    </Nav>
                  )}
                  <Nav>
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="link"
                        className="profile-toggler"
                      >
                        <Avatar
                          name={`${user?.firstName} ${user?.lastName}`}
                          size="36"
                          round={true}
                          email={user?.email}
                        />
                      </Dropdown.Toggle>

                      <Dropdown.Menu align="end" rootCloseEvent="mousedown">
                        <Dropdown.Item
                          style={{
                            minWidth: "280px",
                          }}
                          onClick={() => dispatch(logout())}
                        >
                          Sign Out
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Nav>
                </>
              ) : (
                <LinkContainer to="/sign-in">
                  <S.NavItem active={pathname === "/feedback"}>
                    Sign In
                  </S.NavItem>
                </LinkContainer>
              )}
            </Navbar.Collapse>
          </div>
        </Navbar>
        <Container id="main" className="main" sx={{ paddingTop: "80px" }}>
          {pageTitle && <h4>{pageTitle}</h4>}
          {children}
        </Container>
      </div>
      <FeedbackWidget />
    </>
  );
};

export default PageLayout;
