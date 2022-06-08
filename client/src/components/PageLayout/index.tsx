import React, { FunctionComponent, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBalanceScale, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { Navbar, Container, Nav, NavDropdown, Dropdown } from "react-bootstrap";
import Gravatar from "react-gravatar";
import { LinkContainer } from "react-router-bootstrap";
import "./PageLayout.scss";
import { userSelector, logout } from "../../store/auth";
import { useDispatch } from "react-redux";
import Avatar from 'react-avatar';

type Props = {
  pageTitle?: string;
  id?: string;
  children: ReactNode;
};

const PageLayout: FunctionComponent<Props> = (props) => {
  const { id = "", children, pageTitle } = props;
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  const isAdmin = user.role === "admin";

  return (
    <div className="app-page" id={id}>
      <Navbar bg="white" className="mb-4 py-3">
        <Container>
          <Navbar.Brand>
            <FontAwesomeIcon icon={faBalanceScale} /> &nbsp; SCALES
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <LinkContainer to="/">
                <Nav.Link>Dashboard</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/notebooks">
                <Nav.Link>Notebooks</Nav.Link>
              </LinkContainer>
              {isAdmin && (
                <>
                  <LinkContainer to="/rings">
                    <Nav.Link>Rings</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/users">
                    <Nav.Link>Users</Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
            <Nav>
              <Dropdown>
                <Dropdown.Toggle variant="link" className="profile-toggler">
                  <Avatar name={`${user?.firstName} ${user?.lastName}`} size="36" round={true} email={user?.email} />
                  <span className="ms-2">{user?.email}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                    style={{
                      minWidth: "280px",
                    }}
                    href="#"
                  >
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => dispatch(logout())}>
                    Sign Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container id="main">
        {pageTitle && <h4>{pageTitle}</h4>}
        {children}
      </Container>
    </div>
  );
};

export default PageLayout;
