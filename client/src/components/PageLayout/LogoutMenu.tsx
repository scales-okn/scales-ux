import React from "react";
import { useSelector, useDispatch } from "react-redux";

import { css } from "@emotion/css";
import { userSelector, logout } from "../../store/auth";

import Popover from "@mui/material/Popover";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const LogoutMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const user = useSelector(userSelector);
  const dispatch = useDispatch();

  const containerStyles = css`
    .icon {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      width: 36px;
      border-radius: 50%;
      background-color: var(--success-green);
      text-decoration: none;
      cursor: pointer;
      color: white;
    }

    .item {
      min-width: 180px;
      padding: 1rem;
      transition: 0.2s ease-in-out;
      margin: 6px 0;
      font-size: 18px;

      &:hover {
        background: var(--main-purple-lightest);
      }
    }
  `;

  return (
    user && (
      <div className={containerStyles}>
        <div className="icon" onClick={handleClick}>
          <ArrowDropDownIcon />
          <div className="avatar">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
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
          >
            <div className="item" onClick={() => dispatch(logout())}>
              Sign Out
            </div>
          </Popover>
        )}
      </div>
    )
  );
};

export default LogoutMenu;
