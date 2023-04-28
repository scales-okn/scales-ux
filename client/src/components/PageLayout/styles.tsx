import styled from "styled-components";

export const NavItem = styled.div`
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  font-family: "Esteban", Serif;
  margin-right: 50px;
  cursor: pointer;
  &:hover {
    color: #e2d8f2;
  }
  &:after {
    content: "";
    display: block;
    height: ${(props) => (props.active ? "2px" : "0")};
    width: calc(100% - 2px);
    border-radius: 2px;
    background: white;
    transition: 0.2s all;
    &:hover {
      color: #e2d8f2;
    }
  }
`;

export const Logo = styled.img`
  max-height: 75px;
`;

export const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: white;
  margin: 24px 0;
`;

export const FeedbackWidget = styled.button`
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
  border-radius: 12px;
  font-size: 11px;
  cursor: pointer;
`;
