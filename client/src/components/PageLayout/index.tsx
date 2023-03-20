import React, { FunctionComponent, ReactNode } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

import { userSelector, logout } from "../../store/auth";

import * as S from "./styles";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
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
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  const location = useLocation();
  const { pathname } = location;
  const isAdmin = user?.role === "admin";

  return (
    <>
      <div className="app-page" id={id}>
        <Navbar
          style={{ backgroundColor: "var(--main-purple)", maxHeight: "80px" }}
          className="mb-4 py-3"
        >
          <Container>
            <Navbar.Brand href="/">
              <S.Logo
                src="/ScalesLogo.png"
                style={{ width: 247, height: 75 }}
              />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            {user && (
              <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                  <LinkContainer to="/">
                    <S.NavItem active={pathname === "/"}>Notebooks</S.NavItem>
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
                    </>
                  )}
                </Nav>
                <Nav>
                  <Dropdown>
                    <Dropdown.Toggle variant="link" className="profile-toggler">
                      <Avatar
                        name={`${user?.firstName} ${user?.lastName}`}
                        size="36"
                        round={true}
                        email={user?.email}
                      />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        style={{
                          minWidth: "280px",
                        }}
                        onClick={() => dispatch(logout())}
                      >
                        Sign Out
                      </Dropdown.Item>
                      {/* TODO: Fix this dropdown */}
                    </Dropdown.Menu>
                  </Dropdown>
                </Nav>
              </Navbar.Collapse>
            )}
          </Container>
        </Navbar>
        <Container id="main" className="main">
          {pageTitle && <h4>{pageTitle}</h4>}
          {children}
        </Container>
      </div>

      <FeedbackWidget />
    </>
  );
};

export default PageLayout;
