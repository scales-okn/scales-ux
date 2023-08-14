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

  .feedback-widget {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    bottom: 16px;
    left: 16px;
    height: 32px;
    width: 72px;
    background: var(--main-purple-light);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: 0.2s ease-in-out;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }

  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    width: 36px;
    border-radius: 50%;
    background-color: var(--dark-green);
    color: var(--main-purple);
    text-decoration: none;
    cursor: pointer;
    color: white;
  }
`;
