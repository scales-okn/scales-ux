import * as React from "react";
import { useLocation, Link } from "react-router-dom";
// import { navItemStyles } from "./styles";
import { css } from "@emotion/css";

type NavItemT = {
  linkName: string;
  route: string;
  isMobile?: boolean;
  disableUnderline?: boolean;
};

const NavItem = ({ linkName, route, isMobile, disableUnderline }: NavItemT) => {
  const location = useLocation();
  const { pathname } = location;
  const isActive = pathname === route;

  const navItemStyles = css`
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    font-family: "open-sans";
    font-size: ${isMobile ? "20px" : "16px"};
    margin-bottom: ${isMobile ? "24px" : 0};
    margin-right: 50px;
    cursor: pointer;

    &:hover {
      color: #e2d8f2;
    }

    &:after {
      content: "";
      display: block;
      width: calc(100% - 2px);
      height: ${isActive && !disableUnderline ? "2px" : 0};
      border-radius: 2px;
      background: white;
      transition: 0.2s all;
      &:hover {
        color: #e2d8f2;
      }
    }
  `;

  return (
    <Link
      to={route}
      style={{ textDecoration: "none" }}
      className={`nav-item ${navItemStyles}`}
    >
      <div className="nav-item">{linkName}</div>
    </Link>
  );
};

export default NavItem;
