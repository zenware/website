import { lighten } from "polished";

const colors = {
  primary: "#006699", // Color for buttons or links
  primaryLight: lighten(0.05, "#006699"),
  bg: "white", // Background color
  grey: {
    dark: "rgba(0, 0, 0, 0.9)",
    default: "rgba(0, 0, 0, 0.8)",
    light: "rgba(0, 0, 0, 0.7)",
    ultraLight: "rgba(0, 0, 0, 0.5)"
  },
  white: "white"
};

const transitions = {
  normal: "0.5s"
};

const fontSize = {
  small: "0.9rem"
};

const fontFamily = {
  serif: `BlinkMacSystemFont, -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', serif`,
  sansSerif: `BlinkMacSystemFont, -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif`
};

const breakpoints = {
  tablet: "1200px",
  phone: "600px"
};

const theme = {
  colors,
  transitions,
  fontSize,
  breakpoints,
  fontFamily,
  maxWidth: "1000px",
  baseFontSize: "18px"
};

export default theme;
