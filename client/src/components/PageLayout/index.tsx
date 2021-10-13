import React, { FunctionComponent, ReactNode } from "react";
import { useAuthUser, useSignOut } from "react-auth-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBalanceScale } from "@fortawesome/free-solid-svg-icons";
import {
  Navbar,
  Container,
  Nav,
  Form,
  FormControl,
  Button,
  NavDropdown,
  Dropdown,
} from "react-bootstrap";
import Gravatar from "react-gravatar";
import { LinkContainer } from "react-router-bootstrap";
import "./PageLayout.scss";

type Props = {
  pageTitle?: string;
  children: ReactNode;
};

const PageLayout: FunctionComponent<Props> = (props) => {
  const auth = useAuthUser();
  const signOut = useSignOut();
  const user = auth().user;
  const isAdmin = user.role === "admin";
  const isUser = user.role === "user";

  console.log(user);

  return (
    <>
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
              <LinkContainer to="/rings">
                <Nav.Link>Rings</Nav.Link>
              </LinkContainer>
              {isAdmin && (
                <NavDropdown title="Admin" id="collasible-nav-dropdown">
                  <LinkContainer to="/admin/users">
                    <Nav.Link>Manage Users</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/admin/logs">
                    <Nav.Link>Logs</Nav.Link>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
            <Nav>
              <Form className="d-flex me-lg-3">
                <FormControl
                  type="search"
                  placeholder="Search..."
                  className="mr-2"
                  aria-label="Search"
                />
              </Form>
            </Nav>
            <Nav>
              <Dropdown>
                <Dropdown.Toggle variant="link" className="profile-toggler">
                  <Gravatar
                    size={32}
                    email={user?.email}
                    className="rounded-circle"
                  />
                  <span className="ms-2">{user?.email}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                    style={{
                      minWidth: "280px",
                    }}
                    href="#/action-1"
                  >
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => signOut()}>
                    Sign Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container id="main">
        {props.pageTitle && <h4>{props.pageTitle}</h4>}
        {props.children}
      </Container>
    </>
  );
};

export default PageLayout;
