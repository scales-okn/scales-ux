import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, Tab } from "@mui/material";

import RingsPage from "pages/RingsPage";
import UsersPage from "pages/UsersPage";
import FeedbackPage from "pages/FeedbackPage";
import HelpTextsPage from "pages/HelpTextsPage";
import PageLayout from "components/PageLayout";

import { adminPageStyles } from "./styles";

const AdminPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabPaths = [
    { path: "/admin/rings", component: <RingsPage />, label: "Rings" },
    { path: "/admin/users", component: <UsersPage />, label: "Users" },
    { path: "/admin/feedback", component: <FeedbackPage />, label: "Feedback" },
    {
      path: "/admin/help-texts",
      component: <HelpTextsPage />,
      label: "Help Texts",
    },
  ];

  const selectedTab =
    tabPaths.find((tab) => location.pathname.includes(tab.path)) || tabPaths[0];

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  return (
    <PageLayout>
      <div className={`adminPage ${adminPageStyles}`}>
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
        <div className="container">{selectedTab.component}</div>
      </div>
    </PageLayout>
  );
};

export default AdminPage;
