import { css } from "@emotion/css";

export const styles = css`
  .logo {
    max-height: 75px;
  }

  .divider {
    height: 1px;
    width: 100%;
    background: white;
    margin: 20px 0;
  }
`;

export const logoutMenuStyles = css`
  .icon {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .avatarContainer {
    position: relative;
    height: 50px;
    width: 42px;
    display: flex;
    justify-content: center;
    align-items: center;

    .hoverBg {
      position: absolute;
      height: 42px;
      width: 42px;
      border-radius: 50%;
      background: transparent;
      border: 3px solid white;
      opacity: 0;
      transition: 0.2s all;
      z-index: 101;
      &:hover {
        opacity: 0.5;
      }
    }

    .avatar {
      position: absolute;
      display: flex;
      z-index: 100;
      align-items: center;
      justify-content: center;
      height: 36px;
      width: 36px;
      border-radius: 50%;
      border: 2px solid white;
      text-decoration: none;
      cursor: pointer;
      color: white;
      text-transform: uppercase;
    }
  }
`;
