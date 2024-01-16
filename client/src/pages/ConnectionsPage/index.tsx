import React from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { Tabs, Tab, Box } from "@mui/material";
import ConnectionsTable from "./ConnectionsTable";

const ConnectionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabPaths = [
    {
      path: "/connections",
      component: <ConnectionsTable />,
      label: "Users",
    },
    { path: "/connections/teams", component: <div />, label: "Teams" },
  ];

  const selectedTab =
    tabPaths.find((tab) => location.pathname === tab.path) || tabPaths[0];

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  return (
    <Box sx={{}}>
      <Tabs
        value={selectedTab.path}
        onChange={handleTabChange}
        sx={{
          marginBottom: "40px",
          borderBottom: "1px solid lightgrey",
          backgroundColor: "white",
          position: "fixed",
          width: "100vw",
          zIndex: "999",
        }}
      >
        {tabPaths.map((tab) => (
          <Tab
            key={tab.path}
            label={tab.label}
            value={tab.path}
            wrapped
            sx={{
              fontWeight: "600",
              width: "120px",
            }}
          />
        ))}
      </Tabs>
      <Box sx={{ paddingTop: "120px", maxWidth: "90%", margin: "0 auto" }}>
        {selectedTab.component}
      </Box>
    </Box>
  );
};

export default ConnectionsPage;
