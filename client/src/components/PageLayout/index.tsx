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
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

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
              <Navbar.Text>
                Signed in as:{" "}
                <a onClick={() => signOut()} href="#" className="h6">
                  {auth()?.user?.email}
                </a>
              </Navbar.Text>
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
