import React, { FunctionComponent, ReactNode } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

import { userSelector, logout } from "../../store/auth";

import styled from "styled-components";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./PageLayout.scss";

import Avatar from "react-avatar";
import Copyright from "components/Copyright";

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
  const isAdmin = user.role === "admin";

  const NavItem = styled.div`
    color: white;
    text-transform: uppercase;
    font-size: 15px;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    font-weight: 400;
    font-family: "Esteban", Serif;
    margin-right: 50px;
    cursor: pointer;
    &:hover {
      color: #e2d8f2;
    }
    &:after {
      content: "";
      display: block;
      height: ${(props) => (props.active ? "2px" : "0")};
      width: calc(100% - 2px);
      border-radius: 2px;
      background: white;
      transition: 0.2s all;
      &:hover {
        color: #e2d8f2;
      }
    }
  `;

  const Logo = styled.img`
    max-height: 75px;
  `;

  return (
    <div className="app-page" id={id}>
      <Navbar
        style={{ backgroundColor: "var(--main-purple)", maxHeight: "80px" }}
        className="mb-4 py-3"
      >
        <Container style={{ maxWidth: "1148px" }}>
          <Navbar.Brand href="/">
            <Logo src="/ScalesLogo.png" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <LinkContainer to="/">
                <NavItem active={pathname === "/"}>Notebooks</NavItem>
              </LinkContainer>
              {isAdmin && (
                <>
                  <LinkContainer to="/rings">
                    <NavItem active={pathname === "/rings"}>Rings</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/users">
                    <NavItem active={pathname === "/users"}>Users</NavItem>
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
        </Container>
      </Navbar>
      <Container id="main" className="main">
        {pageTitle && <h4>{pageTitle}</h4>}
        {children}
      </Container>
      <Copyright />
    </div>
  );
};

export default PageLayout;
