import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { sessionUserSelector, logout } from "../../store/auth";

import Popover from "@mui/material/Popover";
import ProfileModal from "./ProfileModal";
import PasswordModal from "./PasswordModal";
import EmailSettingsModal from "./EmailSettingsModal";

import { logoutMenuStyles } from "./styles";

const LogoutMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [emailSettingsModalVisible, setEmailSettingsModalVisible] =
    useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const user = useSelector(sessionUserSelector);
  const dispatch = useDispatch();

  return user ? (
    <div className={logoutMenuStyles}>
      <div className="icon" onClick={handleClick}>
        <div className="avatarContainer">
          <div className="hoverBg" />
          <div className="avatar">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </div>
        </div>
      </div>
      {open && (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          container={anchorEl}
          disableEnforceFocus
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          sx={{
            "& .item": {
              minWidth: "180px",
              padding: "10px 20px",
              transition: " 0.2s ease-in-out",
              margin: "6px 0",
              fontSize: "18px",

              "&:hover": {
                background: "var(--main-purple-lightest)",
              },
            },
          }}
        >
          <div
            className="item"
            onClick={() => {
              setPasswordModalVisible(true);
              handleClose();
            }}
          >
            Change Password
          </div>
          <div
            className="item"
            onClick={() => {
              setProfileModalVisible(true);
              handleClose();
            }}
          >
            Update Info
          </div>
          <div
            className="item"
            onClick={() => {
              setEmailSettingsModalVisible(true);
              handleClose();
            }}
          >
            Email Settings
          </div>
          <div className="item" onClick={() => dispatch(logout())}>
            Sign Out
          </div>
        </Popover>
      )}
      {profileModalVisible ? (
        <ProfileModal
          visible={profileModalVisible}
          setVisible={setProfileModalVisible}
          user={user}
        />
      ) : null}
      {passwordModalVisible ? (
        <PasswordModal
          visible={passwordModalVisible}
          setVisible={setPasswordModalVisible}
        />
      ) : null}
      {emailSettingsModalVisible ? (
        <EmailSettingsModal
          visible={emailSettingsModalVisible}
          setVisible={setEmailSettingsModalVisible}
          user={user}
        />
      ) : null}
    </div>
  ) : null;
};

export default LogoutMenu;
