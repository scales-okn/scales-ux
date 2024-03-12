import * as React from "react";
import { useLocation, Link } from "react-router-dom";
import { Box } from "@mui/material";
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
  const isActive = () => {
    if (linkName === "Notebooks") {
      return pathname === "/";
    } else {
      return pathname.includes(route);
    }
  };

  return (
    <Box
      sx={{
        marginBottom: isMobile ? "24px" : 0,
        marginRight: "50px",
        cursor: "pointer",
        position: "relative",
        fontFamily: "Poppins",

        "*": {
          color: "white",
          fontSize: isMobile ? "20px" : "16px",
          textTransform: "uppercase",
          letterSpacing: "0.09em",
        },

        "&:hover": {
          color: "#e2d8f2",
        },

        "&:after": {
          content: '""',
          display: "block",
          position: "absolute",
          width: "calc(100% - 2px)",
          height: isActive() && !disableUnderline ? "2px" : 0,
          borderRadius: "2px",
          background: "white",
          transition: "0.2s all",
          top: "100%",
          left: 0,
          marginTop: "4px",
        },
      }}
    >
      <Link to={route}>
        <div className="nav-item">{linkName}</div>
      </Link>
    </Box>
  );
};

export default NavItem;
