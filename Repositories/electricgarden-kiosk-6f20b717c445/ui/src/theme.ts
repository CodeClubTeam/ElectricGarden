import { DefaultTheme } from "styled-components/macro";

// DefaultTheme is merged interface see types/styles.d.ts
// wish TS could import a derived type into an interface
export const theme: DefaultTheme = {
  // made these up. not really sure
  active: "#2ED03C",
  inactive: "#CBCBCB",
  fg: "black",
  bg: "white",
  cover: {
    bg: "#f9f9f9",
  },
  section: {
    bg: "white",
    fg: "black",
  },
  btn: {
    borderRadius: "10px",
    primary: {
      fg: "white",
      bg: "#ec008c",
    },
    secondary: {
      fg: "white",
      bg: "#00A8B5",
    },
    danger: {
      fg: "white",
      bg: "#ec001c",
    },
    disabled: {
      fg: "#828282",
      bg: "#BDBDBD",
    },
  },
  scheme: {
    primary: {
      light: "#CEFECD",
    },
    secondary: {
      light: "#5BDAE7",
    },
  },
  greys: {
    mid: "#E0E0E0",
    three: "#828282",
    four: "#bdbdbd",
    six: "#f2f2f2",
  },
  trafficLights: {
    red: "#ec001c",
    orange: "#ffbf00",
    green: "#2ed03c",
  },
};
