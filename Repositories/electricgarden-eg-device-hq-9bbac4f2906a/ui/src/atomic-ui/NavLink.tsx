import { NavLink as ReactRouterNavLink } from "react-router-dom";
import styled from "styled-components/macro";

export const NavLink = styled(ReactRouterNavLink)`
  color: black;
  padding: 1em 1.5em;
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }

  &:active {
    background-color: blue;
  }

  &:visited {
    background-color: transparent;
  }

  &.active {
    background-color: #ccc;
  }
`;
